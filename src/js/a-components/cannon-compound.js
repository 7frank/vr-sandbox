import {testCompoundGLTF} from '../utils/physics-utils';
import * as CANNON from 'cannon';
import {updateHotComponent} from '../utils/aframe-debug-utils';

/**
 * test for a static compound physics object
 * currently used for more complex gltf objects loaded
 */
updateHotComponent('cannon-compound');
AFRAME.registerComponent('cannon-compound', {
  schema: {
    debug: {type: 'boolean', default: false},
    maxSize: {type: 'number', default: 20}
  },
  init: function () {
    if (this.el.hasAttribute('static-body')) console.warn("replacing 'static-body' with 'cannon-compound'");
    this.el.setAttribute('static-body', 'shape:none');

    this.el.addEventListener('model-loaded', function () {
      // the compound generating part

      // TODO looks like the matrizes aren't calculated initally which makes sense as the model is only loaded
      setTimeout(() => testCompoundGLTF(this.el, this.data.debug, this.data.maxSize), 500);
    }.bind(this));
  }
});
