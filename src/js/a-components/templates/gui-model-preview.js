import $ from 'jquery';
import 'aframe-gui/dist/aframe-gui';
import {FPSCtrl} from '../../utils/fps-utils';
import {getClosestEditableRegion} from '../../utils/aframe-utils';

import {Logger} from '../../utils/Logger';
import {getDescriptiveTextForAction} from '../../utils/hotkey-utils';
import {addRegionInteractions_createEntity, removeRegionInteractions_createEntity} from './misc';

// a list that contains template-containers to select them
// first lets have a simple select like in fallout 4
// goal is to select and place
// when placing the templates into the world we should use editable-actor

var console = Logger.getLogger('template-library');

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
