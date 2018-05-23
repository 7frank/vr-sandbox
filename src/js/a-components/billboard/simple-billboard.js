/**
 * most simple of billboard implementation
 * TODO for certain use cases the up vector should be fixed
 */

AFRAME.registerComponent('simple-billboard', {
  tick: function () {
    var camEl = this.el.sceneEl.camera.el;
    var qCam = camEl.object3D.getWorldQuaternion(); // quaternion.clone();
    var qParent = this.el.parentEl.object3D.quaternion.clone();

    this.el.object3D.quaternion.copy(qParent.conjugate()).multiply(qCam);
  }
});
