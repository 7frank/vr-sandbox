import $ from 'jquery';
import * as _ from 'lodash';
import 'aframe-gui/dist/aframe-gui';
import {FPSCtrl} from '../../utils/fps-utils';
import {toast} from '../../utils/aframe-utils';

import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {UndoMgr} from '../../utils/undo-utils';
// a list that contains template-containers to select them
// first lets have a simple select like in fallout 4
// goal is to select and place
// when placing the templates into the world we should use editable-actor

var console = Logger.getLogger('template-library');

const addRegionInteractions_createEntity = (selector, tplData) => {
  var regions = $(selector);
  _.each(regions, function (region) {
    region.setAttribute('template-droppable', true);
    // we need to inject data directly because it is in html notationand can't be added via setAttribute
    // TODO having something like region.setAttribute('template-droppable.template', tpl); would be nice
    region.components['template-droppable'].data.template = tplData;
  });
};

const removeRegionInteractions_createEntity = (selector) => {
  var regions = $(selector);
  _.each(regions, function (region) {
    if (region.hasAttribute('template-droppable')) { region.removeAttribute('template-droppable'); }
  });
};

var behaviourTemplates = {
  flee: 'behaviour-attraction="speed:-1.5"',
  engage: 'behaviour-attraction="speed:0.5"'
};

AFRAME.registerComponent('wireframe', {
  dependencies: ['material'],
  init: function () {
    if (this.el.components.material) {
      this.el.components.material.material.wireframe = true;
    } else {
      console.warn("Can't set wireframe. Does not have material.");
    }
  }
});

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
        opacity="0.7"
        width="3.5"
        height="4"
        >
         
         <a-gui-label  width="3.2" height="0.5" value="Click to select then"></a-gui-label>
         <a-gui-label  width="3.2" height="0.5" value="click on region to"></a-gui-label>
         <a-gui-label  width="3.2" height="0.5" value="place element."></a-gui-label>
         <a-entity gui-item gui-list-view></a-entity>
         
    </a-gui-flex-container>
    `;

    var wrapper = $(`<a-entity></a-entity>`);
    var preview = $(`<a-entity><a-box></a-box></a-entity>`);

    new FPSCtrl(30, function () {
      if (!this.object3D) return;
      this.object3D.rotation.y += 0.01;
    }, preview.get(0)).start();

    var previewWrapper = $(`<a-entity position="3 0 0" ></a-entity>`);
    previewWrapper.append(preview);
    var container = $(containerTemplate);

    wrapper.append(container, previewWrapper);

    // TODO remove droppable on second change to prevent infinite drop
    // TODO ctrl+click== multiple times an element may be dropped no ctrl pressed= only once
    // TODO maybe introduce actions chain-start chain-end?

    container.find('[gui-list-view]').on('change', function (e) {
      console.log('gui-list-view.change', e);
      preview.html('');

      var tplData = e.detail.value;
      var tplInstance = $(tplData);

      tplInstance.attr('wireframe', true);

      tplInstance.attr('material', 'transparent:true;opacity:0.3');
      preview.append(tplInstance);

      // enable region clicking and placing of tpl at position
      //  $('[cursor]').off('click', regionClickWrapper);
      //  $('[cursor]').on('click', regionClickWrapper);

      addRegionInteractions_createEntity('[editable-region]', tplData);
    });
    // });

    // Note: don't append to early otherwise items wont be aligned as component only aligns on init
    $(this.el).append(wrapper);
  }

});

// -----------------------------------------
/*
AFRAME.registerComponent('template-preview', {
  schema: {
    template: {type: 'string'}
  },

  init: function () {

    // TODO list elements in a ring menu

  }

});
*/
/**
 * the next click on the entity this component is bound it will create the template at the intersection point.
 *
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
  },
  remove: function () {
    this.el.removeEventListener('click', this._someClick);
  },
  // TODO use interaction-pick but before that add a convenient alternative function to access intersection data as keyevents don't have such
  onClickTestAccept: function (event) {
    var targetEl = this.el;

    console.log('onClickTestAccept', event);

    if (!this.data.allowNestedDrop) {
      console.log(event.srcElement, targetEl);
      if (event.srcElement != targetEl) {
        toast('nested drop is disabled');
        return;
      }
    }
    toast('dropping template');

    console.log('dropping', event.detail, this);
    var targetPos = event.detail.intersection.point;
    targetPos.y += 1;

    targetPos.sub(this.el.object3D.position);

    var tplInstance = $(this.data.template);

    if (this.data.removable) {
      tplInstance.attr('template-removable', true);
    }

    // update position and write to DOM
    tplInstance.attr('position', AFRAME.utils.coordinates.stringify(targetPos));
    tplInstance.get(0).flushToDOM();

    UndoMgr.addHTMLElementToTarget(tplInstance.get(0), targetEl);

    removeRegionInteractions_createEntity('[editable-region]');
  }

});

// TODO hotkeys action remove-entity bind to mouse-right
//  how would an implementation of that work
AFRAME.registerComponent('template-removable', {
  schema: {},

  init: function () {
    this.el.addEventListener('click', this.onRemoveEvent.bind(this));
  },
  remove: function () {
    this.el.removeEventListener('click', this.onRemoveEvent.bind(this));
  },
  onRemoveEvent: function (event) {
    event.stopPropagation();

    // console.log('template-removable', arguments, this.data, event.detail.intersection);
    toast('template-removable');

    UndoMgr.removeHTMLElement(this.el);
  }

});
