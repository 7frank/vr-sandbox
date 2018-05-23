/**
 * We want to be able to translate rotate and scale a selected object.
 * Therefor we need to add the THREE.TransformControls
 * FIXME controls only work after leavin g the canvas and
 * FIXME centering the cursor at the center of the transform-controls followed by clicking at that position
 *
 **/

import {updateHotComponent} from '../utils/aframe-debug-utils';
import * as _ from 'lodash';
import {UndoMgr} from '../utils/undo-utils';

var TransformControls = require('three-transform-controls')(THREE);

/**
 * Helper for the transform controls. Any entity that has this attached will spawn the controls on click.
 *
 * TODO look into inconsistencies with interaction-pick, click and interaction-talk
 *
 */

AFRAME.registerComponent('transformable', {
  init: function () {
    this.el.addEventListener('click', function () {
      this.el.sceneEl.setAttribute('transform-controls', {target: this.el}); // FIXME the target is the child of the networked somewhat
    }.bind(this));
  }
});

/**
 *  A wrapper for the THREE.TransformControl.
 *
 *  Listens for 'interaction-pick' to rotate through transofrm control modes (translate,rotate,scale).
 *  Listens for 'action-increase', 'action-decrease' to alter the size of the tranform control.
 *  Pressing 'ctrl' will enable snap to grid for transform and rotate modes.
 *
 */
updateHotComponent('transform-controls');
AFRAME.registerComponent('transform-controls', {
  dependencies: ['position', 'rotation', 'scale'],
  schema: {
    target: {
      default: null
    }

  },
  init: function () {
    var that = this;

    var oldValues;

    function onControlMouseDown (e) {
      var object = e.target.object;

      oldValues = {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone()
      };
    }
    // store defaults

    function onControlledObjectChange (e) {
      console.log('objectChange', e);

      if (!that.data.target) return; // TODO target not yet set
      var object = e.target.object;

      var newValues = {
        position: object.position.clone(),
        rotation: object.rotation.clone(),
        scale: object.scale.clone()
      };
      UndoMgr.addHTMLAttributes(that.data.target, newValues, oldValues);
      oldValues = newValues;
    }

    var scene = this.el.sceneEl;
    this.mControl = new TransformControls(scene.camera, scene.renderer.domElement);

    this.mControl.addEventListener('objectChange', _.debounce(onControlledObjectChange, 1000));
    this.mControl.addEventListener('mouseDown', onControlMouseDown);

    this.addEventListeners();
  },
  update: function () {
    if (this.data.target) {
      this.mControl.attach(this.data.target.object3D);
      // this.el.object3D.add(this.mControl);
      // this.data.target.object3D.parent.add(this.mControl);
      this.el.sceneEl.object3D.add(this.mControl);
    } else {
      this.mControl.detach();
    }
  },
  remove: function () {
    this.mControl.dispose();
    if (this.mControl.parent) {
      this.mControl.parent.remove(this.mControl);
    }
  },
  addEventListeners: function () {
    var control = this.mControl;

    /*
                      window.addEventListener('model-edit-translate',function(){})
                      window.addEventListener('model-edit-rotate',function(){})
                      window.addEventListener('model-edit-scale',function(){})
                      window.addEventListener('model-edit-translate',function(){})

                  */

    var modes = ['translate', 'rotate', 'scale'], currMode = -1;

    this.el.addEventListener('interaction-pick', (e) => {
      e.stopPropagation();
      currMode = (currMode + 1) % modes.length;
      control.setMode(modes[currMode]);
    });

    this.el.addEventListener('action-increase', (e) => {
      e.stopPropagation();
      control.setSize(control.size + 0.1);
    });

    this.el.addEventListener('action-decrease', (e) => {
      e.stopPropagation();
      control.setSize(Math.max(control.size - 0.1, 0.1));
    });
    // -------------------------
    window.addEventListener('keydown', function (event) {
      switch (event.keyCode) {
        case 17: // Ctrl
          control.setTranslationSnap(0.5);
          control.setRotationSnap(THREE.Math.degToRad(15));
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
