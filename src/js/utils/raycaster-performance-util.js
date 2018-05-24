import * as _ from 'lodash';
import {injectMethod} from './performance-utils';
import {countDepth} from './aframe-utils';
import {arrayToTree} from './misc-utils';

var tmpRaycastStack = [];

/**
 *
 * @param onBeforeRender
 * @returns {{start, stop, stats}|*}
 */
export function trackRendererPerformance (onBeforeRender) {
  var mStack = [];
  var renderer = document.querySelector('a-scene').renderer;

  var rc = document.querySelector('[raycaster]').components.raycaster.raycaster;
  overrideRelevantRaycasterCode(rc);

  var inspector = injectMethod(renderer, 'render', false, function () {
    onBeforeRender(mStack);
  }, function () {
    if (tmpRaycastStack.length != 0) mStack = tmpRaycastStack;
    tmpRaycastStack = [];
  });
  inspector.start();

  return inspector;
}

/*
window.trackRendererPerformance = trackRendererPerformance;
window.arrayToTree = arrayToTree;
window.countDepth = countDepth;
*/

var raycastInspect;
var treebuffer = [];
export function getRaycastPerfTree (mCallback) {
  var mRaycastPerfData = [];

  if (!raycastInspect) {
    raycastInspect = trackRendererPerformance(_.throttle(function (mRaycastPerfData) {
      var depths = _.map(mRaycastPerfData, t => countDepth(t.object, 'parent')).sort((a, b) => a - b);
      var rootDepth = depths[0];

      var tree = arrayToTree(mRaycastPerfData, {
        id: 'object.uuid',
        parentId: 'object.parent.uuid',
        rootFunc: function (treeItem) {
          return countDepth(treeItem.data.object, 'parent') == rootDepth;
        }
      });

      mCallback(tree);
    }, 1100));
  }

  return raycastInspect;
}

/**
 * This method contains copies of the raycaster code wich should be updated if code of original raycaster changes.
 * Only changes are the time tracking in the intersectObject function (@changed)
 * @param {THREE.Raycaster} rc - An instance of the THREE.Raycaster
 */
function overrideRelevantRaycasterCode (rc) {
  if (Number(THREE.REVISION > 90)) {
    console.warn('raytrace performance tool needs compatability revision');
  }

  // ----------------------------

  function ascSort (a, b) {
    return a.distance - b.distance;
  }

  function intersectObject (object, raycaster, intersects, recursive) {
    if (object.visible === false) return;

    /**
         * @changed
         *
         */

    var t0 = performance.now();
    object.raycast(raycaster, intersects);
    var t1 = performance.now();
    // if (!children.length) //only store leaf nodes
    var info = {time: t1 - t0, object, intersects};
    tmpRaycastStack.push(info);

    if (recursive === true) {
      var children = object.children;

      for (var i = 0, l = children.length; i < l; i++) {
        var t0 = performance.now();
        intersectObject(children[i], raycaster, intersects, true);
        var t1 = performance.now();
        info.cTime = t1 - t0;
      }
    }
  }

  rc.intersectObject = function (object, recursive, optionalTarget) {
    var intersects = optionalTarget || [];

    intersectObject(object, this, intersects, recursive);

    intersects.sort(ascSort);

    return intersects;
  };

  rc.intersectObjects = function (objects, recursive, optionalTarget) {
    var intersects = optionalTarget || [];

    if (Array.isArray(objects) === false) {
      console.warn('THREE.Raycaster.intersectObjects: objects is not an Array.');
      return intersects;
    }

    for (var i = 0, l = objects.length; i < l; i++) {
      intersectObject(objects[i], this, intersects, recursive);
    }

    intersects.sort(ascSort);

    return intersects;
  };
}
