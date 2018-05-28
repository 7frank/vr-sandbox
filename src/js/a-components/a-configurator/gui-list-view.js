import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';

import {suppressedThrottle} from '../../utils/misc-utils';

import combinedSample from './combinedSample.html';
import * as _ from 'lodash';
import {jsonic} from 'jsonic';

/**
 *  TODO helper components order-items-as
 * - grid animate current positions to grid positions
 * - horizontal-list
 * - vertical-list
 * - bin-stacking
 *
 */

// var console = Logger.getLogger('gui-list-view');

AFRAME.registerPrimitive('nk-list-view', {
  defaultComponents: {
    'gui-list-view': {
      items: [{key: 0, value: '-empty-'}],
      type: 'list',
      containerFactory: `<a-entity></a-entity>`,
      itemFactory: `<a-button
              v-for="(item, index) in items"
              :value="item.key"
              :button-color="selectedIndex==index?'slateblue':'slategrey'"
              :position="setPositionFromIndex(index,2,5,2.5,-0.45)" 
              width="2.5"
              height="0.75"
              font-family="Arial"
              margin="0 0 0.05 0"
              @interaction-pick.stop="onItemClicked(item)"
              ></a-button>`
    }
    // rotation: {x: 0, y: -180, z: 0},
    // up: {x: 0, y: -1, z: 0}
  },

  mappings: {
    items: 'gui-list-view.items',
    selectedIndex: 'gui-list-view.selectedIndex',
    itemFactory: 'gui-list-view.itemFactory',
    requiredKeys: 'gui-list-view.requiredKeys'
    // TODO orientation for keys
  }
});

/**
 *  TODO efficient rendering by reusing buttons/elements and clipping planes as well as max amount of visible
 *   see https://threejs.org/examples/webgl_clipping_advanced.html
 *   https://stackoverflow.com/questions/36557486/three-js-object-clipping
 *  TODO also create a component with  additional items recursion (most simple treeview)
 * TODO set container size to wrap around buttons to be able to grab events
 *
 *
 *
 */

const listViewItemFactory = `<a-button  
              v-for="(item, index) in items"
              :value="item.key"    
              :background-color="selectedIndex==index?'slateblue':'slategrey'"
              :position="setPositionFromIndex(index,2,5,2.5,-0.45)" 
              width="2.5" 
              height="0.75" 
              font-family="Arial" 
              margin="0 0 0.05 0" 
              @interaction-pick.stop="onItemClicked(item)"         
              ></a-button>`;

AFRAME.registerComponent('gui-list-view', {
  schema: {
    items: {type: 'array', default: [{key: 0, value: 'hello'}, {key: 1, value: 'world'}]},
    requiredKeys: {type: 'array', default: ['key', 'value']},
    type: {type: 'string', default: 'list'},
    containerFactory: {type: 'string', default: `<a-entity></a-entity>`},
    itemFactory: {type: 'string', default: listViewItemFactory}
  },
  update: function (oldData) {
    // new entries
    console.log('listview update', oldData, this.data.items);
    var addedItems = _.difference(this.data.items, oldData.items);
    var removedItems = _.difference(oldData.items, this.data.items);

    if (addedItems.length > 0) {
      addedItems.forEach(item => this.vm.addItem(item));
      console.log('addedItems', addedItems);
    }
    // removed entries

    if (removedItems.length > 0) {
      removedItems.forEach(item => this.vm.removeItem(item));
      console.log('removedItems', removedItems);
    }

    // ------
    // update view in case the factory methods changed
    if (oldData.containerFactory != this.data.containerFactory || oldData.itemFactory != this.data.itemFactory) {
      this.initViewModel();
    }
  },
  init: function () {
    // read <template> tag and interpret it as json data
    var tplData = this.el.querySelector('template');
    if (tplData) {
      var parsed = jsonic(tplData.innerHTML);

      if (parsed.length >= 0) { this.data.items = parsed; } else { console.error("invalid data in template must be array of objects in less strict json format (see 'jsonic')"); }

      tplData.parentElement.removeChild(tplData);
    }

    // query for itemFactory at entity
    var itemFactoryTpl = this.el.querySelector(':nth-child(1)');
    if (itemFactoryTpl) {
      var parsed = itemFactoryTpl.outerHTML;

      if (parsed.length > 0) { this.data.itemFactory = parsed; } else { console.error('invalid itemFactory'); }

      itemFactoryTpl.parentElement.removeChild(itemFactoryTpl);
    }

    // init the actual view model
    this.initViewModel();
  },
  initViewModel: function () {
    console.log('initViewModel');
    // remove previous vm
    if (this.vm) {
      // this.el.removeChild(this.vm.$el);
      this.vm.$el.parentElement.removeChild(this.vm.$el);

      this.vm = null;
    }

    // TODO code only for testing
    if (this.data.type == 'list') {
      this.vm = createListView(this.data.items, this.data.itemFactory, null, this.data.containerFactory);
    } else if (this.data.type == 'template') {
      this.vm = createImportedModelsListView();
    } else console.error('unknown type');
    console.log('this.vm', this.vm);
    this.el.appendChild(this.vm.$el);
  },
  remove () {
    this.el.removeChild(this.vm.$el);
  }

});

// ----------------------------------
// FIXME don't use objects directly but rather use their indexes and return the items when selection changes
// have a non-intrusive listener for items changes to update vm
export function createListView (items, vueFactoryString, direction = 'column', vueContainerFactoryString) {
  if (!items) {
    items = [{key: '1', value: 'hello'}, {key: '2', value: 'hello'}, {key: '3', value: 'hello'}, {
      key: '4',
      value: 'hello'
    }, {key: '5', value: 'hello'}];
  }
  if (!vueContainerFactoryString) vueContainerFactoryString = '<a-entity></a-entity>';
  if (!vueFactoryString) throw new Error('must have vue based factory string');

  // template -------------------------------------

  var el = createHTML(vueContainerFactoryString);
  let btn = createHTML(vueFactoryString);
  el.appendChild(btn);
  el.setAttribute('ref', 'listView');

  // vue -------------------------------------

  var app = new Vue({
    el: el,

    data: {
      items: items,
      selectedIndex: -1
    },

    methods: {
      setItems: function (items) {
        this.$data.items = items;
      },
      addItem: function (item) {
        this.$data.items.push(item);
      },
      removeItem: function (item) {
        this.$data.items.splice(this.$data.items.indexOf(item), 1);
      },
      onItemClicked: function () {
        var data = this.$data.items[this.$data.selectedIndex];

        var that = this.$refs.listView.childNodes[this.$data.selectedIndex];

        console.log('onItemClicked', data, that);

        var caption = that ? that.getAttribute('value') : '-1'; // TODO improve usability of list view

        if (this.$data.selectedIndex > -1) {
          this.$el.emit('change', data);
        }
      },
      setPositionFromIndex: function (index, xMax, yMax, xScale = 1, yScale = 1) {
        let x = index % xMax;
        let y = parseInt(index / xMax);

        return '' + _.round(xScale * x, 4) + ' ' + _.round(yScale * y, 4) + ' 0';
      }
    },
    watch: {
      items: {
        handler: function (val, oldVal) {
          // TODO not watching all the time
          // console.log('watch.items', val, oldVal);

          //  debouncedUpdate(this);
        },
        deep: false // TODO might interfere with recursive objects
      },
      selectedIndex: {
        handler: function (val, oldVal) {
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
/**
 *
 *
 * refactor
 *
 *
 *
 * @param templates
 */
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
  var app = createListView(templates, `<a-button  
              v-for="(item, index) in items"
              :value="item.key"    
              :button-color="selectedIndex==index?'slateblue':'lightslategrey'"
              :position="setPositionFromIndex(index,1,7,2.5,-0.45)" 
              width="4.5" 
              height="0.75" 
              font-family="Arial" 
              @interaction-pick.stop="onItemClicked(item)"         
              ></a-button>`, null, '<a-entity></a-entity>');

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
