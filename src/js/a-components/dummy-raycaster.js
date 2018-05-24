//

/**
 * Prevents raycaster tests for all child elements.
 *
 */

AFRAME.registerComponent('dummy-raycaster', {
  init: function () {
    this.el.addEventListener('object3dset', (...args) => AFRAME.nk.querySelectorAll(this.el, '.Mesh').forEach(m => m.raycast = function () {}));
  }
});
