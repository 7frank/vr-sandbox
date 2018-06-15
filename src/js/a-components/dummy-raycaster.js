/**
 * Prevents/stubs raycaster tests for all child meshes.
 * @example dummy-raycaster=":where(name='partThatContainsLotsOfTriangles')" - stubs a specific mesh by its name parameter
 * @example dummy-raycaster - stubs all child-meshes
 */

import {querySelectorAll} from '../utils/selector-utils';

AFRAME.registerComponent('dummy-raycaster', {
  schema: {type: 'string', default: '.Mesh'},
  init: function () {
    querySelectorAll(this.el, this.data).forEach(m => m.raycast = function () {});
    this.el.addEventListener('object3dset', (...args) => querySelectorAll(this.el, this.data).forEach(m => m.raycast = function () {}));
  }
});
