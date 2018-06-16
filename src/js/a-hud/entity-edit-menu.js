import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './entity-edit-menu.hbs';
import {showMenu} from '../utils/debug-gui';
import * as _ from 'lodash';

import TWEEN from '@tweenjs/tween.js';

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

    function zoomToPos () {
      var position = { x: _.random(1, 3), y: _.random(1, 3), z: _.random(1, 3) };
      console.error('TODO zoom', position);

      var tween;
      // Setup the animation loop.
      function animate (time) {
        requestAnimationFrame(animate);
        tween.update(time);
      }
      requestAnimationFrame(animate);

      let targetCamera = refs.sphere.getObject3D('touch-rotate-controls-camera');

      console.log('targetCamera', targetCamera);
      tween = new TWEEN.Tween(targetCamera.position) // Create a new tween that modifies 'coords'.
        .to(position, 1000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(function () { // Called after tween.js updates 'coords'.
          // Move 'box' to the position described by 'coords' with a CSS translation.

        })
        .start(); // Start the tween immediately.
    }

    refs.sphere.addEventListener('click', () => {
      zoomToPos();
    });
      TODO use ZoomHelper(other repo)
      //TODO use ZoomHelper(other repo) for better usability and performance
    // FIXME it should be possible to get the result of a selction of the llist view this way
    // selected is not emitted the same way change is (change is working)
    window.oooo = refs;
    refs.listview.addEventListener('change', ({detail}) => {
      zoomToPos();
      console.error(detail);
    });
  }

});
