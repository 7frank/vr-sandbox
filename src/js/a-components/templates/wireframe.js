AFRAME.registerComponent('wireframe', {
  dependencies: ['material'],
  init: function () {
    if (this.el.components.material) {
      this.el.components.material.material.wireframe = true;
    } else {
      console.warn("Can't set wireframe. Does not have material.");
    }
  }
});
