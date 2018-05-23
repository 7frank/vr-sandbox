import {toast} from '../../utils/aframe-utils';

import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {throttle} from 'lodash';
import {suppressedThrottle} from '../../utils/misc-utils';

import combinedSample from './combinedSample.html';

var console = Logger.getLogger('gui-list-view');

/**
 *  TODO efficient rendering by reusing buttons/elements and clipping planes
 *   see https://threejs.org/examples/webgl_clipping_advanced.html
 *   https://stackoverflow.com/questions/36557486/three-js-object-clipping
 *  TODO also create a component with  additional items recursion (most simple treeview)
 *
 *
 *
 *  $("a-scene").append(AFRAME.nk.parseHTML(`<a-entity position="5 5 5" gui-list-view></a-entity>`))
 */

AFRAME.registerComponent('gui-list-view', {
  schema: {
    items: {type: 'array', default: []}
    /* itemFactory: {
               default: function (item) {
                 return item;
               }
             } */
  },
  init: function () {
    // TODO code only for testing
    var app;
    if (this.data.items.length > 0) {
      app = createListView(this.data.items);
    } else {
      app = createImportedModelsListView();
    }

    this.el.appendChild(app.$el);
  }

});

// ----------------------------------
export function createListView (items, vueFactoryString, direction = 'column') {
  if (!items) items = ['hello', 'world', 'test', 'asdf', '1234'];

  // template -------------------------------------
  if (!vueFactoryString) {
    vueFactoryString =
            `<a-gui-button  
              v-for="(item, index) in items"
              :value="item"    
              :background-color="selectedIndex==index?'blue':'yellow'"
              :hover-color="yellow"
              width="2.5" 
              height="0.75"    
              font-family="Arial" 
              margin="0 0 0.05 0" 
              @interaction-pick.stop="onItemClicked(item)"               
              ></a-gui-button>`;
  }

  var el = createHTML(`
       <a-gui-flex-container 
        ref="listView"
        align-items="normal"
        flex-direction="${direction}"  
        component-padding="0.1"
        opacity="0"
        width="3.5"
        >
            ${vueFactoryString}
        </a-gui-flex-container>
  `);

    // vue -------------------------------------
  var app = new Vue({
    el: el,
    data: {
      items: items,
      selectedIndex: -1
    },
    methods: {
      onItemClicked: function () {
        var data = this.$data.items[this.$data.selectedIndex];

        var that = this.$refs.listView.childNodes[this.$data.selectedIndex];

        var caption = that ? that.getAttribute('value') : '-1'; // TODO improve usability of list view

        if (this.$data.selectedIndex > -1) {
          // toast('clicked ' + caption);

          this.$el.emit('change', data);
        }
      }
    },
    watch: {
      items: {
        handler: function (val, oldVal) {
          this.$refs.listView.components['gui-flex-container'].init();
        },
        deep: false // TODO might interfere with recursive objects
      },
      selectedIndex: {
        handler: function (val, oldVal) {
          this.$refs.listView.components['gui-flex-container'].init();

          var _old = this.$refs.listView.childNodes[oldVal];
          var _new = this.$refs.listView.childNodes[val];

          if (_old) _old.emit('mouseleave');
          if (_new) _new.emit('mouseenter');

          if (val > -1) {
            this.onItemClicked();
          }
        }

      }

    }
  });

    // -----------------------------------------

  app.$el.addEventListener(direction == 'column' ? 'player-move-forward' : 'player-strafe-left', suppressedThrottle(function (e) {
    e.stopPropagation();

    if (e.detail.second) return;

    app.$data.selectedIndex--;

    if (app.$data.selectedIndex < 0) app.$data.selectedIndex = 0;
  }, 50));

  app.$el.addEventListener(direction == 'column' ? 'player-move-backward' : 'player-strafe-right', suppressedThrottle(function (e) {
    e.stopPropagation();
    if (e.detail.second) return;

    app.$data.selectedIndex++;

    var len = app.$data.items.length - 1;
    if (app.$data.selectedIndex > len) app.$data.selectedIndex = len;
  }, 50));

  return app;
}

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
  var app = createListView(templates, `<a-gui-button  
              v-for="(item, index) in items"
              :value="item.key"    
              :background-color="selectedIndex==index?'slateblue':'slategrey'"
              width="2.5" 
              height="0.75" 
              font-family="Arial" 
              margin="0 0 0.05 0" 
              @interaction-pick.stop="onItemClicked(item)"         
              ></a-gui-button>`);

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
