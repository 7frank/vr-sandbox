/**
 * refactoring core mechanics to use between bike and car edit
 */

import {querySelectorAll} from '../utils/selector-utils';

import * as _ from 'lodash';

import {Animation} from '@nk11/animation-lib/src/js/animation/Animation';

var prevAnimation;

/**
 *
 * @param obj3d
 * @param targetPos
 */
export function moveObjectToPosition (obj3d, targetPos) {
  if (prevAnimation) prevAnimation.stop();
  prevAnimation = new Animation({position: obj3d.position});
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
