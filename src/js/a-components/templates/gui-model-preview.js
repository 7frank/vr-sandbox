import $ from 'jquery';
import * as _ from 'lodash';
import 'aframe-gui/dist/aframe-gui';
import {FPSCtrl} from '../../utils/fps-utils';
import {getClosestEditableRegion, toast} from '../../utils/aframe-utils';

import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {UndoMgr} from '../../utils/undo-utils';
import {getDescriptiveTextForAction} from '../../utils/hotkey-utils';
import {roundTo} from '../../utils/misc-utils';
import {isShiftDown} from '../../utils/file-drag-drop-utils';

import productConfigSample1 from '../a-configurator/productConfigSample1.html';
import {getIntersectedEl, getPlayer, placeInFrontOfEntity} from '../../game-utils';

// a list that contains template-containers to select them
// first lets have a simple select like in fallout 4
// goal is to select and place
// when placing the templates into the world we should use editable-actor

var console = Logger.getLogger('template-library');

/**
 * TODO for now, only the closest region is used. but we might encounter problems when adding templates next to other regions this way.
 * @param selector
 * @param tplData
 */
const addRegionInteractions_createEntity = (selector, tplData) => {
  var regions = $(selector);
  _.each(regions, function (region) {
    region.setAttribute('template-droppable', true);
    // we need to inject data directly because it is in html notation and can't be added via setAttribute
    region.setAttribute('template-droppable', 'template', tplData);
  });
};

const removeRegionInteractions_createEntity = (selector) => {
  var regions = $(selector);
  _.each(regions, function (region) {
    if (region.hasAttribute('template-droppable')) {
      region.removeAttribute('template-droppable');
    }
  });
};

var behaviourTemplates = {
  flee: 'behaviour-attraction="speed:-1.5"',
  engage: 'behaviour-attraction="speed:0.5"'
};

// -----------------------------------------

AFRAME.registerComponent('gui-model-preview', {
  schema: {
    items: {type: 'array', default: []},
    itemFactory: {
      default: function (item) {
        return item;
      }
    }
  },

  init: function (HALPP = false) {
    // FIXME justify-content="center" breaks component
    // FIXME also  items are not aligned

    var containerTemplate = `
    <a-gui-flex-container align-items="normal"
       flex-direction="column"  
        component-padding="0.1"
        opacity="0"
        width="3.5"
        height="4"
        >
         <a-entity scale=".5 .5 .5" position="-3.5 -4.3 0" 
         simple-dialog="caption:Trigger ${getDescriptiveTextForAction('interaction-pick')} , ${getDescriptiveTextForAction('player-move-forward')} or ${getDescriptiveTextForAction('player-move-backward')} to select an element that is shown to the right as preview. Then click on a region below your feet to place one such instance."></a-entity>
         <a-entity id="listView" gui-template-list="type:template"></a-entity>
         
    </a-gui-flex-container>
    `;

    var wrapper = $(`<a-entity></a-entity>`);
    var preview = $(`<a-entity><a-box wireframe></a-box></a-entity>`);

    // FIXME instead of hiding one preview and showing the other one at the region we should reuse the preview or emit an event/don't handle it directly
    // $(this.el).on('focus', preview.attr('visible', true));
    // $(this.el).on('blur', preview.attr('visible', false));

    new FPSCtrl(30, function () {
      if (!this.object3D) return;
      this.object3D.rotation.y += 0.01;
    }, preview.get(0)).start();

    var previewWrapper = $(`<a-entity position="5 0 0" ></a-entity>`);
    previewWrapper.append(preview);
    var container = $(containerTemplate);

    // FIXME this is not how hotkey info texts should be rendered
    setTimeout(function initText () {
      console.error('timeout');
      var dlg = container.find('[simple-dialog]').get(0);
      // dlg.setAttribute('simple-dialog', 'caption', `Press ${getDescriptiveTextForAction('interaction-pick')} , ${getDescriptiveTextForAction('player-move-forward')} or ${getDescriptiveTextForAction('player-move-backward')} to select an element that is shown to the right as preview. Then click on a region below your feet to place one such instance.`);

      if (dlg.components['simple-dialog']) {
        dlg.components['simple-dialog'].vm.$data.caption = `Press ${getDescriptiveTextForAction('interaction-pick')}, ${getDescriptiveTextForAction('player-move-forward')} or ${getDescriptiveTextForAction('player-move-backward')}\n to select an element that is shown to the right as preview. Then click on a region below your feet to place one such instance. Hold "Shift" to be able to place more than one element at once.`;
      } else {
        console.error('not found, bad code :-P');
      }
    }, 5000);

    wrapper.append(container, previewWrapper);

    // TODO maybe introduce a way to chain changes to the undomanager to be able to create/alter in one step

    var that = this;
    container.find('#listView').on('change', function (e) {
      preview.html('');

      var tplData = e.detail.value;
      var tplInstance = $(tplData);

      tplInstance.attr('wireframe', true);

      tplInstance.attr('material', 'transparent:true;opacity:0.3');
      preview.append(tplInstance);

      // remove previous entries just in case
      if (that.mTargetRegions) {
        removeRegionInteractions_createEntity(that.mTargetRegions);
      }
      that.mTargetRegions = getClosestEditableRegion(that.el.sceneEl);
      addRegionInteractions_createEntity(that.mTargetRegions, tplData);
    });

    // Note: don't append to early otherwise items wont be aligned as component only aligns on init
    $(this.el).append(wrapper);
  }

});

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

/**
 * FIXME performance and stuff
 * TODO this is probably redundant by using the raycaster or cursor cmoponent and filtering intersections  for regions
 *
 * @returns {render}
 */
function raycasterHelper (el, interval = 20) {
  var raycaster = new THREE.Raycaster();
  var intersects;

  return {
    cast: _.throttle(function render (camera, elements, recursive = false) {
      let mousePosition = el.sceneEl.systems.pointer.position;
      raycaster.setFromCamera(mousePosition, camera);
      intersects = raycaster.intersectObjects(elements, recursive);

      return intersects[0];
    }, interval)
  };
}
