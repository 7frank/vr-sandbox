import {testCompoundGLTF} from '../selector-util';
import * as CANNON from 'cannon';

window.AFRAME = require('aframe');
const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

/**
 * test for a static compound physics object
 * currently used for more complex gltf objects loaded
 */

AFRAME.registerComponent('cannon-compound', {
  schema: {
    debug: {type: 'boolean', default: false}
  },
  init: function () {
    if (this.el.hasAttribute('static-body')) console.warn("replacing 'static-body' with 'cannon-compound'");
    this.el.setAttribute('static-body', 'shape:none');

    this.el.addEventListener('model-loaded', function () {
      // the compound generating part

      // TODO looks like the matrizes aren't calculated initally which makes sense as the model is only loaded
      setTimeout(() => testCompoundGLTF(this.el, this.data.debug), 500);
    }.bind(this));
  }
});
