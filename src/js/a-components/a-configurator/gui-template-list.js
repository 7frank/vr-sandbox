/**
 *
 *
 * refactor
 *
 *
 *
 * @param templates
 */

import _ from 'lodash';
import {createListView} from './gui-list-view';
import {createHTML} from '../../utils/dom-utils';
import combinedSample from './combinedSample.html';
/**
 * Simple color select with accent colors.
 * Note: default selection of color is triggered by action: "interaction-pick" not click event
 *
 *
 */

AFRAME.registerComponent('gui-template-list', {
  schema: {},
  init: function () {
    this.vm = createImportedModelsListView();

    this.el.appendChild(this.vm.$el);
  },

  remove: function () {
    this.el.removeChild(this.vm.$el);
  }

});

function createTemplateListView (templates) {
  if (!templates) {
    templates = [
      {key: 'box', value: '<a-box></a-box>'},
      {key: 'sphere', value: '<a-sphere></a-sphere>'},
      {key: 'torus', value: '<a-torus color="#43A367" arc="350" radius="2" radius-tubular="0.1"></a-torus>'},
      {
        key: 'torus knot',
        value: '<a-torus-knot color="#B84A39" arc="180" p="2" q="4" radius="1" radius-tubular="0.1"></a-torus-knot>'
      },
      {
        key: 'dir-light',
        value: '<a-tube scale=".4 .4 .4"><a-entity light="type: directional; color: #FFF; intensity: 0.5"></a-entity></a-tube>'
      }, {
        key: 'point-light',
        value: '<a-sphere scale=".4 .4 .4"><a-entity light="type: point; intensity: 0.75; distance: 50; decay: 2"></a-entity></a-sphere>'
      }, {
        key: 'spot-light',
        value: '<a-cone scale=".4 .4 .4"><a-entity light="type: spot; angle: 20"></a-entity></a-cone>'
      },
      {key: 'text', value: '<a-text value="{{text:string}}"></a-text>'},
      {
        key: 'animatedBox', value: `<a-box src="#boxTexture" 
        position="0 0.5 0" 
        rotation="0 45 45" 
        scale="1 1 1" 
        material="color:red">
        <a-animation attribute="position" to="0 2 -1" direction="alternate" dur="2000"
            repeat="indefinite"></a-animation>
   </a-box>`
      }, {
        key: 'combined', value: combinedSample
      }, {
        key: 'izzy', value: `<a-entity
          shadow="cast: true; receive: false"
          scale="0.008 0.008 0.008"
          --behaviour-attraction="speed:0.5"
          animation-mixer="clip: *;"
          gltf-model="src: url(assets/models/Izzy/scene.gltf);">
    </a-entity>`
      }
    ];
  }

  // toggle="true"
  var app = createListView(templates, {itemFactory: `<a-button  
              v-for="(item, index) in items"
              :value="item.key"    
              :button-color="selectedIndex==index?'slateblue':'lightgrey'"
              :position="setPositionFromIndex(index,2,5,2,-0.45)" 
              width="1.5" 
              height="0.75" 
              font-family="Arial" 
              @interaction-pick.stop="onItemClicked(index)"         
              ></a-button>`}, 'row', false, true);

  return app;
}

function createImportedModelsListView () {
  var app = createTemplateListView();

  // listen for models that are imported
  document.addEventListener('model-imported', function (e) {
    var str = e.detail.modelEl.getAttribute('gltf-model');

    var templateString = `<a-entity
          shadow="cast: true; receive: false"
          animation-mixer="clip: *;"
          gltf-model="src: url(${str});">
      </a-entity>`;

    app.$el.setAttribute('position', '0 0 3');
    app.$data.items.push({key: str, value: templateString});
  });

  app.$el.addEventListener('change', function (e) {
    console.log('TODO do something ', e);
  });

  return app;
}
