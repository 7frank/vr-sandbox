import {BoxHelperExt} from '../three/BoxHelperExt';
import {FPSInfo, FPSCtrl} from '../utils/fps-utils';
import {setLayersForObject, Layers} from '../types/Layers';
import {isVisibleTo} from '../utils/aframe-utils';

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

    this.mHelper = new BoxHelperExt(obj);

    setLayersForObject(this.mHelper, Layers.Bounds);

    obj.parent.add(this.mHelper);

    this.updateBBoxScript = new FPSCtrl(0.5, function (e) {
      //  check if the layer of the boxhelper is visible
      if (!isVisibleTo(this.mHelper, this.el.sceneEl.camera)) return;

      // render each frame here
      this.mHelper.update(undefined, obj.parent, true, false);
    }, this);
    this.updateBBoxScript.start();
  },
  getPerformanceInfo () {
    return FPSInfo('bb')
      .add('updateBBoxScript', this.updateBBoxScript)
      .compile();
  },
  remove: function () {
    var obj = this.el.getObject3D('mesh') || this.el.object3D;
    obj.parent.remove(this.mHelper);
    this.updateBBoxScript.pause();
  }

});
