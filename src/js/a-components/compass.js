
window.AFRAME = require('aframe');
const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

AFRAME.registerComponent('compass', {
  init: function () {

  },

  tick: function () {
    var yRotation = this.el.sceneEl.camera.parent.rotation.y;
    this.el.components.material.material.map.offset.x = yRotation / (4 * Math.PI);
  }
});
