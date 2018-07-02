// -----------------------------------------
import $ from 'jquery';
import {getIntersectedEl} from '../../game-utils';
import * as _ from 'lodash';
import {roundTo} from '../../utils/misc-utils';
import {getClosestEditableRegion, toast} from '../../utils/aframe-utils';
import {createHTML} from '../../utils/dom-utils';
import {raycasterHelper, removeRegionInteractions_createEntity} from './misc';
import {isShiftDown} from '../../utils/file-drag-drop-utils';
import {UndoMgr} from '../../utils/undo-utils';

// -----------------------------------------

/**
 * the next click on the entity this component is bound it will create the template at the intersection point.

 */

AFRAME.registerComponent('template-droppable', {
  schema: {
    accept: {type: 'selector', default: '*'},
    template: {type: 'string', default: '<a-sphere></a-sphere>'},
    removeOnDrop: {type: 'boolean', default: true},
    removable: {type: 'boolean', default: true},
    allowNestedDrop: {type: 'boolean', default: false}
  },

  init: function () {
    this._someClick = this.onClickTestAccept.bind(this);
    this.el.addEventListener('click', this._someClick);

    // TODO add preview element when hovering over target regions

    this.createPreview();

    // this.mCursor = document.querySelector('[cursor]').components.cursor;

    this.rayHelper = raycasterHelper(this.el, 20);
  },
  remove: function () {
    this.el.removeEventListener('click', this._someClick);

    this.el.remove(this.mPreview);
  },
  update: function (oldData) {
    if (oldData.template != this.data.template) {
      this.createPreview();
    }
  },
  createPreview: function () {
    if (this.mPreview) {
      this.el.remove(this.mPreview);
    }
    this.mPreview = createHTML(this.data.template);
    this.mPreview.setAttribute('wireframe', true);
    this.mPreview.setAttribute('visible', false);
    this.el.append(this.mPreview);
  },
  tick: function () {
    // FIXME this is partially working apart from adding an element to every region in the dom  as template-droppable is added to all regions not only those next to the player
    // FIXME also implementation of raycaster is  bad performance wise

    // if (this.mCursor.intersectedEl != this.el) return;
    if (getIntersectedEl() != this.el) return;

    // var targetPos = this.mCursor.intersectedEventDetail.intersection.point;

    // this.mPreview.object3D.position.copy(targetPos);

    var cam = this.el.sceneEl.camera.clone();
    var pos = this.el.sceneEl.camera.el.object3D.position;
    cam.position.copy(pos);

    var region = AFRAME.nk.querySelectorAll(this.el, '.Mesh')[0];

    var intersection = this.rayHelper.cast(cam, [region], false);

    if (intersection) {
      // var targetPos = this.mCursor.intersectedEventDetail.intersection.point;

      // FIXME point offset is wrong

      var point = _.mapValues(intersection.point, coord => roundTo(coord, 0.25));
      point.y += 1;
      this.mPreview.object3D.position.copy(point);
      this.mPreview.setAttribute('visible', true);
      // console.log(intersection);
    }
  },
  // TODO use interaction-pick but before that add a convenient alternative function to access intersection data as keyevents don't have such
  onClickTestAccept: function (event) {
    var targetEl = this.el;

    // console.log('onClickTestAccept', event);

    if (!this.data.allowNestedDrop) {
      console.log(event.srcElement, targetEl);
      if (event.srcElement != targetEl && event.srcElement != this.mPreview) {
        toast('nested drop is disabled');
        return;
      }
    }
    // toast('creating template');

    // console.log('dropping', event.detail, this);
    var targetPos = event.detail.intersection.point;
    targetPos.y += 1;

    targetPos.sub(this.el.object3D.position);

    var tplInstance = $(this.data.template);

    if (this.data.removable) {
      tplInstance.attr('template-removable', true);
    }
    // note: for testing, make it interact with physics by default
    tplInstance.attr('dynamic-body', true);
    tplInstance.attr('configurable', true);
    tplInstance.attr('pickable', true);

    // update position and write to DOM
    tplInstance.attr('position', AFRAME.utils.coordinates.stringify(targetPos));
    tplInstance.get(0).flushToDOM();

    UndoMgr.addHTMLElementToTarget(tplInstance.get(0), targetEl);

    var mTargetRegions = getClosestEditableRegion(this.el.sceneEl);

    if (!isShiftDown()) {
      removeRegionInteractions_createEntity(mTargetRegions);
    }
  }

});
