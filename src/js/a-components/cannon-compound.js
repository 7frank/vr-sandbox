import {testCompoundGLTF} from '../selector-util';
import * as CANNON from 'cannon';

window.AFRAME = require('aframe');
const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

/**
 * test for a static compound physics object
 * currently used for more complex gltf objects loaded
 */

/**
 * Creates a wireframe for the body, for debugging.
 * TODO(donmccurdy) – Refactor this into a standalone utility or component.
 * @param  {CANNON.Body} body
 * @param  {CANNON.Shape} shape
 */
function createWireframe (body, shape) {
  var offset = shape.offset,
    orientation = shape.orientation,
    mesh = CANNON.shape2mesh(body).children[0];
  var wireframe;
  wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({color: 0xff0000})
  );

  if (offset) {
    wireframe.offset = offset.clone();
  }

  if (orientation) {
    orientation.inverse(orientation);
    wireframe.orientation = new THREE.Quaternion(
      orientation.x,
      orientation.y,
      orientation.z,
      orientation.w
    );
  }

  return wireframe;
}

/**
 * Updates the debugging wireframe's position and rotation.
 */
function syncWireframe (wireframe) {
  var offset;

  // Apply rotation. If the shape required custom orientation, also apply
  // that on the wireframe.
  wireframe.quaternion.copy(this.body.quaternion);
  if (wireframe.orientation) {
    wireframe.quaternion.multiply(wireframe.orientation);
  }

  // Apply position. If the shape required custom offset, also apply that on
  // the wireframe.
  wireframe.position.copy(this.body.position);
  if (wireframe.offset) {
    offset = wireframe.offset.clone().applyQuaternion(wireframe.quaternion);
    wireframe.position.add(offset);
  }

  wireframe.updateMatrix();
}

AFRAME.registerComponent('cannon-compound', {
  schema: {
    debug: {type: 'boolean', default: false}
  },
  init: function () {
    if (this.el.hasAttribute('static-body')) console.warn("replacing 'static-body' with 'cannon-compound'");
    this.el.setAttribute('static-body', 'shape:none');

    this.el.addEventListener('model-loaded', function () {
      // the compound generating part
      testCompoundGLTF(this.el, this.data.debug);

      // a reverse test that  generates wireframes from body instead above one from mesh boundingbox to check for errors of collision
      this.el.body.shapes.forEach((shape) => {
        var wireframe = createWireframe(this.el.body, shape);
        wireframe.name = 'wireframe-bb-physics';
        syncWireframe.bind(this.el)(wireframe);
        this.el.sceneEl.object3D.add(wireframe);
        // this.el.object3D.add(wireframe);
      });
    }.bind(this));
  }
});
