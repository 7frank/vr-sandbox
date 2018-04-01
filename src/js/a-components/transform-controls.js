/**
 * We want to be able to translate rotate and scale a selected object.
 * Therefor we need to add the THREE.TransformControls
 * FIXME controls only work after leavin g the canvas and
 * FIXME centering the cursor at the center of the transform-controls followed by clicking at that position
 *
 **/

import {updateHotComponent} from '../utils/aframe-debug-utils';

var TransformControls = require('three-transform-controls')(THREE);

/**
 * Helper for the transform controls. Any entity that has this attached will spawn the controls on click.
 */

// alert('Next sync objects when moving them and when creating');
AFRAME.registerComponent('transformable', {
  init: function () {
    this.el.addEventListener('click', function () {
      var FIXME = this.el.parentEl.parentEl;// .querySelector('.content'); //null atm

      this.el.sceneEl.setAttribute('transform-controls', {target: FIXME}); // FIXME the target is the child of the networked somewhat
    }.bind(this));
  }
});

/**
 *  A wrapper for the THREE.TransformControl.
 *
 */
updateHotComponent('transform-controls');
AFRAME.registerComponent('transform-controls', {
  schema: {
    target: {
      default: null
    }

  },
  init: function () {
    var that = this;
    function onControlChange () {
      // console.log(that.data.target.getAttribute('position'));
      // console.log(that.data.target.object3D.position);
      console.log(this, arguments);
      that.data.target.setAttribute('position', this.position);// TODO works with bugs
      that.data.target.setAttribute('rotation', this.rotation);// FIXME doesn't work
      that.data.target.setAttribute('scale', this.scale);// same here, not working
    }

    var scene = this.el.sceneEl;
    this.mControl = new TransformControls(scene.camera, scene.renderer.domElement);
    this.mControl.addEventListener('change', onControlChange);
    this.addEventListeners();

    this.el.setObject3D('control', this.mControl);

    this.update();
  },
  update: function () {
    if (this.data.target) {
      // TODO check out where exactly to add the controls and what settings for setSpace are correct.
      this.mControl.attach(this.data.target.object3D);
      //  this.el.object3D.add(this.mControl);

      // this.data.target.object3D.parent.add(this.mControl);

      this.el.sceneEl.object3D.add(this.mControl);
    }
  },
  remove: function () {
    this.el.removeObject3D('control');
  },
  addEventListeners: function () {
    var control = this.mControl;

    /*
      TODO should be able to dis/enable hotkeys per category to be able to switch between modi

      window.addEventListener('model-edit-translate',function(){})
      window.addEventListener('model-edit-rotate',function(){})
      window.addEventListener('model-edit-scale',function(){})
      window.addEventListener('model-edit-translate',function(){})

  */
    // TODO use keymap + remove keys
    window.addEventListener('keydown', function (event) {
      switch (event.keyCode) {
        case 81: // Q
          control.setSpace(control.space === 'local' ? 'world' : 'local');
          break;

        case 17: // Ctrl
          control.setTranslationSnap(1);
          control.setRotationSnap(THREE.Math.degToRad(15));
          break;

        case 87: // W
          control.setMode('translate');
          break;

        case 69: // E
          control.setMode('rotate');
          break;

        case 82: // R
          control.setMode('scale');
          break;

        case 187:
        case 107: // +, =, num+
          control.setSize(control.size + 0.1);
          break;

        case 189:
        case 109: // -, _, num-
          control.setSize(Math.max(control.size - 0.1, 0.1));
          break;
      }
    });

    window.addEventListener('keyup', function (event) {
      switch (event.keyCode) {
        case 17: // Ctrl
          control.setTranslationSnap(null);
          control.setRotationSnap(null);
          break;
      }
    });
  }

});
