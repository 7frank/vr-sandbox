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
import {findClosestEntity, getDirectionForEntity, FPSCtrl} from '../util';
import {getHotkeyDialog, getTextEditorInstance} from './utils';
import pretty from 'pretty';

import 'aframe-gridhelper-component';
import {Blob2Text, fetchHandleErrors, streamIn} from '../stream-utils';

window.AFRAME = require('aframe');
const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

AFRAME.registerComponent('editable-region', {
  schema: {
    src: {type: 'string'},
    height: {type: 'number', default: 1},
    width: {type: 'number', default: 100},
    depth: {type: 'number', default: 100},
    loadDistance: {type: 'number', default: 150}, // TODO doesnt work as intended
    unloadDistance: {type: 'number', default: 250}
  },
  init: function () {
    this.mInitialized = false;

    if (this.el.tagName != 'A-BOX') throw new Error('currently only supports a-box');

    this.el.setAttribute('depth', this.data.depth);
    this.el.setAttribute('height', this.data.height);
    this.el.setAttribute('width', this.data.width);
    this.el.setAttribute('static-body', true);
    this.el.setAttribute('shadow', 'cast: false; receive: true');
    this.el.setAttribute('bb', true);
    this.el.setAttribute('material', 'opacity: 0.5; transparent: true;color: white');

    //  this.el.setAttribute('physics', 'debug: true');

    if (this.data.src) console.warn('a region must have a src attribute that links to a valid chunk of data (a html file containing a-frame definitions of registered objects)');

    /**
       * TODO support performance by not only unloading far away regions but by only rendering elements that are big enough
       * For example:
       * el=jQuery("[gltf-model]")[2];
       * having a query method that groups elements together by boundingSphere.radius
       * queryResult=AFRAME.nk.querySelectorAll(el.object3D,".Mesh:where(geometry-boundingSphere-radius<50)");
       * queryResult.forEach(obj=>obj.visible=!obj.visible)
       * TODO also minimize necessary queries by listening to movement
       */

    var visiblityCheck = new FPSCtrl(1, function (e) {
      // change animation if possible at random
      if (!this.mInitialized) return;

      // el=jQuery("[gltf-model]")[2];
      // query elements of region that are smaller than 50 unit
      var queryResult = AFRAME.nk.querySelectorAll(this.el.object3D, '.Mesh:where(geometry-boundingSphere-radius<5)');

      if (this.lastDistance > this.data.loadDistance * 5 / 6) { queryResult.forEach(obj => obj.visible = false); } else { queryResult.forEach(obj => obj.visible = true); }
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

      $(el).html('');
    }
    if (distance < loadDistance && this.mInitialized == false) {
      console.log('attach content');
      this.mInitialized = true;
      //  var element = $(`<a-entity static-body gridhelper="size:100;divisions:50"></a-entity>`);
      var src = this.data.src;

      // TODO cancel loading if distance if greater again and unloading would occure while loading region
      // TODo load and attach chunks of datta via actual stream ...
      streamIn(src)
        .then(response => response.blob())
        .then(blob => Blob2Text(blob))
        .then(function (text) {
          //  var element = $(`<a-box bb src="#region-road" static-body color="#CCC" depth="50" height="1" width="50"></a-box>`);
          // element.append(text);
          //  $(el).append(element);
          $(el).append(text).attr({
            // 'src': '#region-road',
            color: '#CCC'
          });
        })
        .catch(function (err) {
          console.warn('fufufu', err);

          var element = $(`<a-text look-at="src:[camera]" color="#f00" width=100 align="center" position="0 6 0" value="${err.status} ${err.statusText}"></a-text>`);
          $(el).append(element);
          var element = $(`<a-text look-at="src:[camera]" color="#f00" width=50 align="center" position="0 3 0" value="'${err.url}'"></a-text>`);
          $(el).append(element);

          $(el).attr({color: '#F66'});
        });
    }
  }

});
