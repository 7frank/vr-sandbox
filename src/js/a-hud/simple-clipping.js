/**
 * This component provides clipping of certain areas and objects. In other words it replicates the css "overflow:none" behaviour.
 * TODO use the bounding box if dimensions are not provided
 * TODO have a system instead of a component for the gui as every udlr-planes will share its normals with each others gui elements planes
 * TODO handle nesting (currently clipping planes are overridden by parent instances of the same component)
 * TODO also it overrides any other implementations of clipping
 *  Note: planes are in world coords and are recomputed each tick
 * FIXME does not show listview when only attached to preview
 * FIXME does not clip preview if listview items have clipping
 * FIXME also if attached to preview the pv ca't be rotated or scaled
 *
 *
 * https://stackoverflow.com/questions/45611247/local-clipping-of-planes-based-on-local-axis
 *
 */

import {getPlayer} from '../game-utils';
import {getWorldDirection, getWorldPosition} from '../utils/aframe-utils';
import {querySelectorAll} from '../utils/selector-utils';
import * as _ from 'lodash';
import {FPSCtrl} from '../utils/fps-utils';

// ---------------------------------------
// ---------------------------------------
// ---------------------------------------
// ---------------------------------------

AFRAME.registerComponent('simple-clipping', {
  dependencies: ['material'],
  schema: {
    dimensions: {type: 'vec4', default: '.5 .5 .5 .5'}, // top left bottom right
    debug: {type: 'boolean', default: false}
  },
  init: function () {
    let material = this.el.components.material.material;

    var left = new THREE.Plane(new THREE.Vector3(1, 0, 0), 1);
    var right = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1);

    var upper = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1);
    var lower = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1);
    this.mPlanes = {upper, lower, left, right};

    this.el.sceneEl.renderer.localClippingEnabled = true;
    //, right, lower, upper

    let dummy = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);

    material.clippingPlanes = [dummy.clone(), dummy.clone(), dummy.clone(), dummy.clone()];
    material.clipShadows = true;

    // update materials clipping planes of child elements on a timer
    // TODO queries are to cpu consuming .. have alternative approach for updating materials
    this.clippingScript = new FPSCtrl(10, () => {
      let materials = querySelectorAll(this.el, ':where(material)');
      // add clipping planes to child element materials
      _.each(materials, mesh => {
        mesh.material.clippingPlanes = material.clippingPlanes;
        mesh.material.clipShadows = true;
      });
    }).start();

    this.mMaterialPlanes = material.clippingPlanes;

    // ---------------------------------------
    // add some helper planes geometries... visible only at the scene root
    if (this.data.debug) {
      var helper = new THREE.PlaneHelper(material.clippingPlanes[0], 5, 0xffff00);

      this.el.sceneEl.object3D.add(helper);

      var helper2 = new THREE.PlaneHelper(material.clippingPlanes[1], 5, 0xff0000);
      this.el.sceneEl.object3D.add(helper2);

      var helper3 = new THREE.PlaneHelper(material.clippingPlanes[2], 5, 0x00ff00);
      this.el.sceneEl.object3D.add(helper3);

      var helper4 = new THREE.PlaneHelper(material.clippingPlanes[3], 5, 0x0000ff);
      this.el.sceneEl.object3D.add(helper4);

      this.mHelper = [helper, helper2, helper3, helper4];
    }
    // ---------------------------------------
  },
  remove: function () {
    this.clippingScript.stop();
  },
  tick: function () {
    let worldMatrix = this.el.object3D.matrixWorld;
    let [left, right, upper, lower] = this.mMaterialPlanes;

    upper.copy(this.mPlanes.upper);
    upper.constant = this.data.dimensions.x;
    upper.applyMatrix4(worldMatrix);

    left.copy(this.mPlanes.left);
    left.constant = this.data.dimensions.y;
    left.applyMatrix4(worldMatrix);

    lower.copy(this.mPlanes.lower);
    lower.constant = this.data.dimensions.z;
    lower.applyMatrix4(worldMatrix);

    right.copy(this.mPlanes.right);
    right.constant = this.data.dimensions.w;
    right.applyMatrix4(worldMatrix);
  }
});
