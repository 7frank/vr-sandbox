import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './entity-edit-menu.hbs';
import {showMenu} from '../utils/debug-gui';
import * as _ from 'lodash';

import TWEEN from '@tweenjs/tween.js';
import {querySelectorAll} from '../utils/selector-utils';
import {getWorldDirection, getWorldPosition} from '../utils/aframe-utils';

AFRAME.registerComponent('entity-edit-menu', {
  schema: {},
  init: function () {
    this.createDialog();
  },

  createDialog: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    var that = this;
    var el = createHTML(template());

    // FIXME vuejs does not like to interact this way.. either it declines @focus or items
    /* this.vm = new Vue({
        el: el,
        // template: template(),
        data: this.data,
        methods: {
          onStartClick: function (e) {
            // alert('start');
          }
        }
      });
      this.el.append(this.vm.$el);
  */
    this.el.append(el);

    // fix vue bug meanwhile use refs for bindings
    let params = el.querySelectorAll(['[ref]']).toArray();
    let refs = _.reduce(params, function (obj, param) {
      obj[param.getAttribute('ref')] = param;
      return obj;
    }, {});

    function zoomToPos (targetCamera, meshDetails) {
      var position = new THREE.Vector3(_.random(1, 20) / 10, _.random(1, 20) / 10, _.random(1, 20) / 10);
      window.ooo = meshDetails;
      console.error('mesh', meshDetails);
      // var position = meshDetails.relativePosition.clone();
      let dir = getWorldDirection(meshDetails.mesh);

      position.add(dir);

      console.error('zoomTo', position);

      var tween;
      // Setup the animation loop.
      function animate (time) {
        requestAnimationFrame(animate);
        tween.update(time);
      }
      requestAnimationFrame(animate);

      console.log('targetCamera', targetCamera);
      tween = new TWEEN.Tween(targetCamera.position) // Create a new tween that modifies 'coords'.
        .to(position, 1000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(function () { // Called after tween.js updates 'coords'.
          // Move 'box' to the position described by 'coords' with a CSS translation.
        })
        .start(); // Start the tween immediately.
    }

    /*  refs.sphere.addEventListener('click', () => {
      zoomToPos();
    }); */

    function getMesh (o) {
      let els = document.querySelectorAll(o.selector).toArray();
      console.log(o);
      if (o.part == undefined) o.part = '.Mesh';

      console.log(o.selector, '---', o.part);

      let subQueryResult = querySelectorAll(els[0], o.part);

      // --------

      console.log('getMesh positions', getWorldPosition(els[0].object3D), getWorldPosition(subQueryResult[0]));
      let relativePosition = getWorldPosition(els[0].object3D).sub(getWorldPosition(subQueryResult[0]));
      // -----

      return {mesh: subQueryResult[0], relativePosition};
    }

    // TODO use ZoomHelper(other repo) for better usability and performance
    // TODO it should be possible to get the result of a selection of the list view this wa
    // list view component should probably have some default emtters for change and selected
    // selected is not emitted the same way change is (change is working)
    window.oooo = refs;
    refs.listview.addEventListener('selected', ({detail}) => {
      let meshDetails = getMesh(detail);

      let targetCamera = refs.sphere.getObject3D('touch-rotate-controls-camera');
      zoomToPos(targetCamera, meshDetails);
    });
  }

});
