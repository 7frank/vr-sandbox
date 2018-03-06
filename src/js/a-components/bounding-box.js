import {BoxHelperExt} from '../three/BoxHelperExt';
import {FPSCtrl} from '../util';

window.AFRAME = require('aframe');
const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

/**
 * creates a axis aligned bounding box (aabb) for a entity it is attached to
 *
 * Example:
 * <a-sphere bb ></a-sphere>
 *
 */

AFRAME.registerComponent('bb', {
  schema: {
    // fps: 0.5

  },
  init: function () {
    var obj = this.el.getObject3D('mesh') || this.el.object3D;

    if (!obj) console.error('no obj defined for bbox helper');

    var helper = new BoxHelperExt(obj);

    obj.parent.add(helper);

    var fc = new FPSCtrl(0.5, function (e) {
      // render each frame here
      helper.update(undefined, obj.parent, true, false);
    });
    fc.start();
  }
});
