/**
 *
 * TODO a region is a box in 3d space
 * that holds arbitrary content and allows the player or npc to only leave itself at the edges if and only if
 * they intersect with another region at that specific point allowing for a transition between
 * TODO for editing a region has one author and a list of collaborators it should be able to use git for that one.
 * so in the background a user might have a git repo that manages commits and merges and so on
 * TODO regions should not extend into one another more than x percent (5% per direction)
 * TODO we'd need soe automatic test build-server that loads different regions and tests them against some constrictions
 * -integrity
 * -stability
 * -interoperability
 * after that a world consisting of a set of regions should be safe to run publicly where users may join
 * -this might change in creative or design mode where multiple regions should be live editable but even there a region should be tested for:
 * --polygoncount/normalised-framerate
 * -- TODO if someone injects hazardous code a vote kick system for that user and his region could be implemented
 * TODO as so often.. how to handle remote relative resources like sound, images, models and so on
 * - for starters .. convention .. resources are linked via src attribute and we'll url-rewrite the data
 *
 *
 * TODO a region may have local physics applied via component "gravity" so whenever a player entity enters a region it gets attached and whenever he leaves it gets detached again
 * also the gravity component might update the up vector of the player-entity
 * // Listen for physics ticks
 playerBody.world.addEventListener('postStep', function () {

    // Direction towards (0,0,0)

    playerBody.force.set(
        -playerBody.position.x,
        -playerBody.position.y,
        -playerBody.position.z
    ).normalize();

    // Set magnitude to 10
    playerBody.force.scale(10, playerBody.force);

    // Cancel gravity force from the world
    playerBody.force.y += 10;

});
 *
 *
 * TODO a region should have a spawning point and a killzone so whenever an entity gets in contact with the killzone it can respawn
 * pseudo-code:
 *      killzone.on("collide",(e) => region.respawn(e.otherEl))
 *
 *
 */

import $ from 'jquery';
import {FPSCtrl} from '../utils/fps-utils';

import 'aframe-gridhelper-component';
import {Blob2Text, streamIn} from '../utils/stream-utils';
import MaterialFadeMixin from '../mixins/MaterialFadeMixin';
import * as _ from 'lodash';

import {Layers, setLayersForObject} from '../types/Layers';
import {debugText} from '../utils/aframe-utils';

AFRAME.registerComponent('editable-region', {
  schema: {
    src: {type: 'string', default: ''},
    height: {type: 'number', default: 1},
    width: {type: 'number', default: 100},
    depth: {type: 'number', default: 100},
    loadDistance: {type: 'number', default: 70}, // TODO changing parameters doesn't work as intended, see below
    unloadDistance: {type: 'number', default: 150}
  },
  init: function () {
    this.mInitialized = false;

    if (this.el.tagName != 'A-BOX') throw new Error('currently only supports a-box');

    // FIXME
    setLayersForObject(this.el.getObject3D('mesh'), Layers.Default, Layers.Static);

    // ------------------------------------------
    // FIXME RenderMixin and extend to performanceMixin
    //  TODO have some text util for stuff like this// rendering a-text for info offline will try to load font and not display stuff although we could/should use our local font
    // add timers to track performance

    function initInfo (obj) {
    // TODO threejs object3D does not trigger before render

      var meshes = AFRAME.nk.querySelectorAll(obj, '.Mesh');

      for (var obj of meshes) {
        if (typeof obj.deltaTimes == 'object') return; //

        obj.deltaTimes = [];

        var timer = new THREE.Clock(false);
        obj.onBeforeRender = function () {
          timer.start();
        };
        obj.onAfterRender = function () {
          var dt = timer.getElapsedTime();

          this.deltaTimes.push(dt * 1000);
          // max queue length
          if (this.deltaTimes.length > 60) {
            this.deltaTimes.shift();
          }
        };
      }
    }

    this.el.getPerfInfo = function () {
      var meshes = AFRAME.nk.querySelectorAll(this.object3D, '.Mesh');

      var tAvg = _.chain(meshes)
        .map(obj => !obj.deltaTimes ? 0 : _.mean(obj.deltaTimes))
        .sum()
        .round(4)
        .value();

      return {
        averageTime: tAvg, // _.round(_.sum(meshes.map(obj => !obj.deltaTimes ? 0 : _.mean(obj.deltaTimes))), 4),
        averageTimeUnit: 'ms',
        numMeshes: meshes.length,
        meshes: meshes
        // max: _.max(meshes.map(obj => _.mean(obj.deltaTimes))),
      };
    };

    this.el.showPerfInfo = function () {
      // TODO adaptive height or better foreground renderpass
      var element = $(`<a-text  font="assets/fonts/DejaVu-sdf.fnt"  look-at="src:[camera]" color="#0f0" width=30 align="center" position="0 10 0" value="0 mSec"></a-text>`);
      $(this).append(element);
      new FPSCtrl(1, function () {
        initInfo(this.object3D);

        var info = this.getPerfInfo();
        element.get(0).setAttribute('value', `tAvg(${info.averageTimeUnit}):${info.averageTime}`);
      }, this)
        .start();
    };

    // ------------------------------------------

    this.el.setAttribute('depth', this.data.depth);
    this.el.setAttribute('height', this.data.height);
    this.el.setAttribute('width', this.data.width);
    this.el.setAttribute('static-body', true);
    this.el.setAttribute('shadow', 'cast: false; receive: true');
    this.el.setAttribute('bb', true);
    this.el.setAttribute('material', 'opacity: 0.5; transparent: true;color: white');

    //  this.el.setAttribute('physics', 'debug: true');

    if (!this.data.src) console.warn('a region must have a src attribute that links to a valid chunk of data (a html file containing a-frame definitions of registered objects)');

    /**
         * TODO support performance by not only unloading far away regions but by only rendering elements that are big enough
         * For example:
         * el=jQuery("[gltf-model]")[2];
         * having a query method that groups elements together by boundingSphere.radius
         * queryResult=AFRAME.nk.querySelectorAll(el.object3D,".Mesh:where(geometry-boundingSphere-radius<50)");
         * queryResult.forEach(obj=>obj.visible=!obj.visible)
         * TODO also minimize necessary queries by listening to movement
         *
         */

    var visiblityCheck = new FPSCtrl(1, function (e) {
      // change animation if possible at random
      if (!this.mInitialized) return;

      // el=jQuery("[gltf-model]")[2];
      // query elements of region that are smaller than 50 unit
      var queryResult = AFRAME.nk.querySelectorAll(this.el.object3D, '.Mesh:where(geometry-boundingSphere-radius<5)');
      // TODO create a Mixin that specifically targets fadeInOut with distance to camera AnimationMixing or MaterialFadeMixin
      // MaterialFadeMixin()
      if (this.lastDistance > this.data.loadDistance * 5 / 6) {
        queryResult.forEach(obj => {
          obj.visible = false;
        });
      } else {
        queryResult.forEach(obj => {
          obj.visible = true;
        });
      }
    }, this).start();
  },
  tick: function (time, timeDelta) {
    // check if actor is close enough or far enough to load unload content

    const unloadDistance = this.data.unloadDistance;
    const loadDistance = this.data.loadDistance;

    var actor3D = this.el.sceneEl.camera.parent;
    var el = this.el;

    var distance = this.lastDistance = actor3D.position.clone().sub(el.object3D.position).length();

    if (distance > unloadDistance && this.mInitialized == true) {
      console.log('detach content');
      this.mInitialized = false;

      // TODO this deletes the current state of the region .. but we might want to be able to store a state of the region (maybe on the server or cache it)
      $(el).html('');
    }
    if (distance < loadDistance && this.mInitialized == false) {
      console.log('attach content');
      this.mInitialized = true;
      //  var element = $(`<a-entity static-body gridhelper="size:100;divisions:50"></a-entity>`);
      var src = this.data.src;

      // TODO cancel loading if distance if greater again and unloading would occur while loading region
      // TODO load and attach chunks of data via actual stream ...
      if (src) {
        streamIn(src)
          .then(response => response.blob())
          .then(blob => Blob2Text(blob))
          .then(function (text) {
            $(el).append(text).attr({
            // 'src': '#region-road',
              color: '#CCC'
            });

            $(el).append(debugText(src, Layers.Log));
          })
          .catch(function (err) {
            console.warn('Error', err);

            var element = $(`<a-text look-at="src:[camera]" color="#f00" width=100 align="center" position="0 6 0" value="${err.status} ${err.statusText}"></a-text>`);
            $(el).append(element);
            var element2 = $(`<a-text look-at="src:[camera]" color="#f00" width=50 align="center" position="0 3 0" value="'${err.url}'"></a-text>`);
            $(el).append(element2);

            $(el).attr({color: '#F66'});
          });
      }
    }
  }

});
