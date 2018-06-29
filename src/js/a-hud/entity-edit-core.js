/**
 * refactoring core mechanics to use between bike and car edit
 */

import {querySelectorAll} from '../utils/selector-utils';

import ZoomUtil from '../utils/ZoomUtils';
import {AnimationFactory} from '../utils/animation-utils';
import * as _ from 'lodash';

/**
 * FIXME not working.. disable touchrotate controls before debugging
 */
var prevAnimation;

export function zoomToPos (targetCamera, controls, meshDetails) {
  if (prevAnimation) prevAnimation.stop();
  var targetPosition = meshDetails.relativePosition.clone();
  console.log('zoomTo orig', targetPosition);
  targetPosition.multiply(meshDetails.mesh.scale);

  let distance = meshDetails.radius * meshDetails.mesh.scale.length() * 2;

  // TODO not working with the bike model ads its positions are not relative but absolute
  // let dir = getWorldDirection(meshDetails.mesh);
  // position.multiplyScalar(0.1);
  // position.add(dir);

  let newCameraPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, 1));

  console.log('zoomTo', targetPosition);

  prevAnimation = ZoomUtil.moveToPosition(newCameraPosition, targetCamera, targetPosition, distance, undefined, (...args) => {
    controls.update();
  });
}

/**
 *
 * @param obj3d
 * @param targetPos
 */
export function moveObjectToPosition (obj3d, targetPos) {
  let prevAnimation = AnimationFactory({position: obj3d.position});
  prevAnimation.animate({position: targetPos}, 400);
}

/**
 * query for a object3d and then for a specific part within it
 * @param o - the data object of the entity-edit-menu component
 * @returns {*}
 */
export function getMesh (o) {
  let els = document.querySelectorAll(o.selector).toArray();

  if (els.length == 0) return null; //

  if (o.part == undefined) o.part = '.Mesh';

  // console.log(o.selector, '---', o.part);

  let subQueryResult = querySelectorAll(els[0], o.part);

  return subQueryResult[0];
}

/**
 *
 * @param el
 * @param selector
 * @returns {*}
 */
export
function getMapOfElementsBySelectorAttrValue (el, selector = '[ref]') {
  let params = el.querySelectorAll(selector).toArray();
  return _.reduce(params, function (obj, param) {
    obj[param.getAttribute('ref')] = param;
    return obj;
  }, {});
}
