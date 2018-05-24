/**
 * most simple of billboard implementation
 * TODO for certain use cases the up vector should be fixed
 */

import {getWorldQuaternion} from '../../utils/aframe-utils';

AFRAME.registerComponent('simple-billboard', {
  tick: function () {
    var camEl = this.el.sceneEl.camera.el;
    var qCam = getWorldQuaternion(camEl.object3D); // quaternion.clone();
    var qParent = this.el.parentEl.object3D.quaternion.clone();

    this.el.object3D.quaternion.copy(qParent.conjugate()).multiply(qCam);
  }
});
