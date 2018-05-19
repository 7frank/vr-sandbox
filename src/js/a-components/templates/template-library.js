import $ from 'jquery';
import * as _ from 'lodash';
import 'aframe-gui/dist/aframe-gui';
import {FPSCtrl} from '../../utils/fps-utils';
import {toast} from '../../utils/aframe-utils';

import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {UndoMgr} from '../../utils/undo-utils';
import {getDescriptiveTextForAction} from '../../utils/hotkey-utils';
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
        opacity="0"
        width="3.5"
        height="4"
        >
         <a-entity scale=".5 .5 .5" position="-3.5 -4.3 0" 
         simple-dialog="caption:Trigger ${getDescriptiveTextForAction('interaction-pick')} , ${getDescriptiveTextForAction('player-move-forward')} or ${getDescriptiveTextForAction('player-move-backward')} to select an element that is shown to the right as preview. Then click on a region below your feet to place one such instance."></a-entity>
         <a-entity gui-item gui-list-view></a-entity>
         
    </a-gui-flex-container>
    `;

    var wrapper = $(`<a-entity></a-entity>`);
    var preview = $(`<a-entity><a-box wireframe></a-box></a-entity>`);

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
    toast('creating template');

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
    this.closeEl = createHTML(`<a-entity look-at="src:[camera]" position="0 1 0"><a-circle  material="side: double; color: red; transparent: true; opacity: 0.7"  radius=".1"></a-circle><a-text position="-.0775 .025 0" value="x"></a-text></a-entity>`);
    this.el.append(this.closeEl);

    this.closeEl.addEventListener('click', this.onRemoveEvent.bind(this));

    // TODO
    this.el.addEventListener('focus', () => this.closeEl.setAttribute('material', 'opacity:0.9'));
    this.el.addEventListener('blur', () => this.closeEl.setAttribute('material', 'opacity:0.3'));
  },
  remove: function () {
    this.closeEl.removeEventListener('click', this.onRemoveEvent.bind(this));
  },
  onRemoveEvent: function (event) {
    event.stopPropagation();

    // console.log('template-removable', arguments, this.data, event.detail.intersection);
    toast('removed entity');

    UndoMgr.removeHTMLElement(this.el);
  }

});
