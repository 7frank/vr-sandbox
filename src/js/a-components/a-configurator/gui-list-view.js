import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';

import {forceStopPlayerMovement, throttleFinally} from '../../utils/misc-utils';

import * as _ from 'lodash';
import {jsonic} from 'jsonic';
import {Box3Ext} from '../../three/Box3Ext';

/**
 * util for vue that triggers a global function if it exists
 * @param path
 * @param args
 */
export
function emit (path, ...args) {
  let fn = _.get(window, path, function () {
    console.error(path + ' not found');
  });

  this.$el.emit(path, args);

  // TODO remove as soon as events are final for sandbox
  if (typeof fn != 'function') console.error(path + ' must be a function');
  else fn(...args);
}

/**
 *  TODO helper components order-items-as
 * - grid animate current positions to grid positions
 * - horizontal-list
 * - vertical-list
 * - bin-stacking (probably is going into separate layout component)
 * TODO if list contains more elements than defined to be visible n items should be preloaded as well as when end of list is reached new elements should popin
 * Note: recycle existing entities

 * --------------------------------------
 * partially visible list-views :
 * - to do so alter default templates
 * - (1) replace "for...in items" with "for ... in visibleItems(lowerDelta,upperDelta)" where lower- and upperDelta are numbers like -2,2 for 2 items below the current selection and 2 after the current selection are visible
 * - (2) replace parts where selectedIndex is compared to index with isSelected(index)
 */

var console = Logger.getLogger('gui-list-view');
// FIXME mappings not working
AFRAME.registerPrimitive('nk-list-view', {
  defaultComponents: {
    'gui-list-view': {
      items: [{key: 0, value: '-empty-'}],
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
              @interaction-pick.stop="onItemClicked(index)"
              ></a-button>`
    }
    // rotation: {x: 0, y: -180, z: 0},
    // up: {x: 0, y: -1, z: 0}
  },

  mappings: {
    items: 'gui-list-view.items',
    datasource: 'gui-list-view.datasource',
    'selected-index': 'gui-list-view.selectedIndex', // the id of the currently selected array entry
    'required-keys': 'gui-list-view.requiredKeys',
    overflow: 'gui-list-view.overflow',
    invert: 'gui-list-view.invert',
    orientation: 'gui-list-view.orientation',
    arrows: 'gui-list-view.arrowsVisible'
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
 * TODO have some default emitters for change and selected events .. on the other hands this might interfere with the customization
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
              @interaction-pick.stop="onItemClicked(index)"         
              ></a-button>`;

AFRAME.registerComponent('gui-list-view', {
  schema: {

    items: {
      type: 'array',
      default: [{key: 0, value: 'hello'}, {key: 1, value: 'world'}]
    },
    selectedIndex: {type: 'number', default: -1},
    requiredKeys: {type: 'array', default: ['key', 'value']}, // TODO
    overflow: {type: 'boolean', default: false}, // behaviour what happens if end of list is reached and user still selects next element. if enabled, after the last element selected the first will be the next one.
    invert: {type: 'boolean', default: false}, // whether to invert the controls
    orientation: {type: 'string', default: 'column'}, // the orientation of the controls up/down== row left/right==column
    arrowsVisible: {type: 'boolean', default: true},
    arrowFactory: {type: 'string', default: `<a-triangle material="opacity:0.3;transparent:true;"></a-triangle>`}, // TODO if defined add arrow at start and end
    containerFactory: {type: 'string', default: `<a-entity></a-entity>`}, // html string that relies on vue attributes
    itemFactory: {type: 'string', default: listViewItemFactory}, // html string that relies on vue attributes
    datasource: {type: 'string', default: 'template'}
  },
  update: function (oldData) {
    // new entries
    // console.warn('listview update', oldData, this.data);
    var addedItems = _.difference(this.data.items, oldData.items);
    var removedItems = _.difference(oldData.items, this.data.items);

    if (addedItems.length > 0) {
      addedItems.forEach(item => this.vm.addItem(item));
    }
    // removed entries

    if (removedItems.length > 0) {
      removedItems.forEach(item => this.vm.removeItem(item));
    }

    // ------
    // update view in case the factory methods changed
    if (oldData.containerFactory != this.data.containerFactory || oldData.itemFactory != this.data.itemFactory) {
      this.initViewModel();
    }
    // update selectedIndex
    if (oldData.selectedIndex != this.data.selectedIndex) {
      if (this.vm.$data.selectedIndex != this.data.selectedIndex) {
        this.vm.$data.selectedIndex = this.data.selectedIndex;
      }
    }
  },
  computeBoundingBox: function () {
    this.bb = new THREE.Box3();
    this.bb.setFromObject(this.el.object3D);
    return this.bb;
  },
  addArrows: function () {
    if (!this.data.arrowsVisible) return;
    console.log('adding arrows');

    // temporarily remove from parent for boundingbox to calculate correctly
    if (this.vm && this.minArrow) {
      this.vm.$el.remove(this.minArrow);
    }
    if (this.vm && this.maxArrow) {
      this.vm.$el.remove(this.maxArrow);
    }

    if (!this.minArrow) {
      this.minArrow = createHTML(this.data.arrowFactory);
      this.minArrow.mPos = this.minArrow.object3D.position.clone();

      this.minArrow.addEventListener('interaction-pick', (e) => {
        e.stopPropagation();
        this.vm.$data.selectedIndex--;
      });
    }
    if (!this.maxArrow) {
      this.maxArrow = createHTML(this.data.arrowFactory);
      this.maxArrow.mPos = this.maxArrow.object3D.position.clone();

      this.maxArrow.addEventListener('interaction-pick', (e) => {
        e.stopPropagation();
        this.vm.$data.selectedIndex++;
      });
    }
    // using aabb in relative coordinate system instead of default Box3 will result in correct rotation
    var box = new Box3Ext();
    box.setFromObject(this.el.object3D, this.el.object3D, true, true);
    console.log('arrow box', box);
    let {min, max} = box;

    let z = (max.z - min.z) / 2;

    min.z += z;
    max.z -= z;

    if (this.data.orientation == 'column') {
      let y = (max.y - min.y) / 2;

      min.y += y;
      max.y -= y;

      this.minArrow.object3D.rotation.z = Math.PI / 2;
      this.maxArrow.object3D.rotation.z = -Math.PI / 2;
    } else {
      let x = (max.x - min.x) / 2;
      min.x += x;
      max.x -= x;

      this.minArrow.object3D.rotation.z = Math.PI;
      this.maxArrow.object3D.rotation.z = 0;
    }
    console.log('updating arrows', min, max);

    // FIXME the arrow position is not exactly at the border where it was before we introducted datasources
    // removing and adding the arrow might have to to something with it
    // as setting an initial position will not do
    // set invisible instead and then visible after bbox recalc

    this.minArrow.object3D.position.copy(this.minArrow.mPos.clone().add(min));
    this.maxArrow.object3D.position.copy(this.maxArrow.mPos.clone().add(max));

    // TODO scaling of arrows is wrong
    /*  let scaleArrow =  this.data.orientation != 'column' ? max.y - min.y : max.x - min.x;
                                                                this.minArrow.object3D.scale.x = scaleArrow;
                                                                this.maxArrow.object3D.scale.x = scaleArrow;

                                                                */

    this.vm.$el.append(this.minArrow);
    this.vm.$el.append(this.maxArrow);
  },
  setItems: function (items) {
    this.vm.setItems(items);
  },
  init: function () {
    // read <template> tag and interpret it as less strict json data

    if (this.data.datasource == 'template') {
      this.initDefaultTemplateDatasource();
    } else {
      let isInstance = this.data.datasource[0] == '#';

      const listenToDatasource = (datasourceEl) => {
        datasourceEl.addEventListener('data-change', (e) => {
          let data = e.detail.items;
          console.log('data-change', e, data);
          this.data.items = data;
          if (this.vm) {
            this.vm.$data.items = data;
            this.addArrows();
          }
        });
      };

        /**
         * TODO add the possibility to reference other listviews like #lw1:selected
         */

      if (isInstance) {
        // Test if the datasource is a HTMLElement instance of some sort.
        var datasourceEl = this.el.sceneEl.querySelector(this.data.datasource);

        if (datasourceEl) {
          this.data.items = datasourceEl.data.items;
          if (this.vm) this.vm.$data.items = datasourceEl.data.items;
          listenToDatasource(datasourceEl);
        } else {
          console.error('datasource instance not found ');
        }
      } else {
        // Otherwise the datasource might be a static component,
        // in which case an instance of it will be generated at the list-view itself.
        listenToDatasource(this.el);
        this.el.setAttribute(this.data.datasource, {});
      }
    }

    this.initItemFactory();

    // init the actual view model
    this.initViewModel();
  },
  initItemFactory: function () {
    // query for itemFactory at entity
    var itemFactoryTpl = this.el.querySelector(':nth-child(1)');
    console.log('itemFactory', itemFactoryTpl);
    if (itemFactoryTpl) {
      var parsed = itemFactoryTpl.outerHTML;

      if (parsed.length > 0) {
        this.data.itemFactory = parsed; // FIXME when update is called from setting settAttr("items",[]) the previous itemFactory is used
      } else {
        console.error('invalid itemFactory');
      }

      itemFactoryTpl.parentElement.removeChild(itemFactoryTpl);
    }
  },
  initDefaultTemplateDatasource: function () {
    var tplData = this.el.querySelector('template');
    console.log('template', tplData);
    if (tplData) {
      var parsed = jsonic(tplData.innerHTML);

      if (parsed.length >= 0) {
        this.data.items = parsed;
      } else {
        console.error("invalid data in template must be array of objects in less strict json format (see 'jsonic')");
      }

      tplData.parentElement.removeChild(tplData);
    }
  },
  initViewModel: function () {
    // remove previous vm
    if (this.vm) {
      this.vm.$el.parentElement.removeChild(this.vm.$el);
      this.vm = null;
    }

    this.vm = createListView(this.data.items, {
      itemFactory: this.data.itemFactory,
      containerFactory: this.data.containerFactory,
      arrowFactory: this.data.arrowFactory
    }, this.data.orientation, this.data.overflow, this.data.invert);
    this.el.appendChild(this.vm.$el);

    setTimeout(() => {
      this.addArrows();
    }, 500);
  },
  remove () {
    if (this.vm) {
      this.vm.$el.removeChild(this.minArrow);
      this.vm.$el.removeChild(this.maxArrow);
      this.vm.$el.parentElement.removeChild(this.vm.$el);
      this.vm = null;
      this.data.items = [];
    }
  }

});

// ----------------------------------
// TODO have a non-intrusive listener for items changes to update vm
export function createListView (items, {itemFactory, containerFactory, arrowFactory}, direction = 'column', overflow = false, invertControls = false) {
  if (!items) {
    items = [{key: '1', value: 'hello'}, {key: '2', value: 'hello'}, {key: '3', value: 'hello'}, {
      key: '4',
      value: 'hello'
    }, {key: '5', value: 'hello'}];
  }
  if (!containerFactory) containerFactory = '<a-entity></a-entity>';
  if (!itemFactory) throw new Error('must have vue based factory string');

  // template -------------------------------------

  var el = createHTML(containerFactory);
  let btn = createHTML(itemFactory);
  el.appendChild(btn);
  el.setAttribute('ref', 'listView');

  // vue -------------------------------------

  var app;
  app = new Vue({
    el: el,

    data: {
      items: items,
      hoveredIndex: -1,
      _selectedIndex: -1,
      get selectedIndex () {
        return this._selectedIndex;
      },
      set selectedIndex (newVal) {
        // instead of using a watcher
        // (which results in triggering the events twice when cthe property itself is mutated from within the handler),
        // we ass setters manually to be able to restrict the selectedIndex

        let oldVal = this._selectedIndex;
        var len = app.$data.items.length - 1;
        if (newVal > len) newVal = overflow ? 0 : len;
        if (newVal < 0) newVal = overflow ? len : 0;

        if (newVal == oldVal) return;

        // ---------------------------------
        this._selectedIndex = newVal;

        app.updateSelection(newVal, oldVal);
      },

      selectedOffset: 0 // the offset for the visible items
    },

    methods: {
      emit: emit,
      setItems: function (items) {
        this.$data.items = items;
      },
      addItem: function (item) {
        if (this.$data.items.indexOf(item) == -1) {
          this.$data.items.push(item);
        }
      },
      removeItem: function (item) {
        this.$data.items.splice(this.$data.items.indexOf(item), 1);
      },
      onThat: function (index, evtName = 'none') {
        var data = this.$data.items[this.$data.selectedIndex];

        var that = this.$refs.listView.childNodes[this.$data.selectedIndex];

        console.log('onItem', evtName, data, that);

        var caption = that ? that.getAttribute('value') : '-1'; // TODO improve usability of list view

        // notify first order children manually
        this.$refs.listView.childNodes.forEach(v => v.dispatchEvent(new CustomEvent(evtName, {bubbles: false})));

        if (this.$data.selectedIndex > -1) {
          if (evtName != 'none') {
            this.$el.emit(evtName, data);
          }
        }
      },
      onItemClicked: function (index) {
        if (index != undefined) {
          index += this.$data.selectedOffset; // fixes visible offset
          this.$data.selectedIndex = index;

          return;
        }

        this.onThat(index, 'change');
      },
      onItemSelected: function (index) {
        if (index != undefined) {
          index += this.$data.selectedOffset; // fixes visible offset
          this.$data.selectedIndex = index;

          //    return;
        }

        this.onThat(index, 'selected');
      },
      onItemHover: function (index) {
        if (index != undefined) {
          index += this.$data.selectedOffset; // fixes visible offset
          this.$data.hoveredIndex = index;
        }

        this.onThat(index, 'hover');
      },

      setPositionFromIndex: function (index, xMax, yMax, xScale = 1, yScale = 1) {
        let x = index % xMax;
        let y = parseInt(index / xMax);

        return '' + _.round(xScale * x, 4) + ' ' + _.round(yScale * y, 4) + ' 0';
      },
      isSelected: function (index) {
        return this.$data.selectedIndex - this.$data.selectedOffset == index;
      },
      isHovered: function (index) {
        return this.$data.hoveredIndex - this.$data.selectedOffset == index;
      },
      /**
             * returns the items that should be visible relative to the selectedIndex
             * @param lowerDelta - the last n items before the index
             * @param upperDelta - the next n items after the index
             */
      getVisibleItems: function (lowerDelta = -2, upperDelta = 2) {
        // validate that it has the selectedIndex visible or else it does not make sense
        if (lower > 0) throw new Error('must be <= zero');
        if (upper < 0) throw new Error('must be >= zero');

        // `this` points to the vm instance
        let mIndex = this.$data.selectedIndex;
        if (mIndex < 0) mIndex = 0;

        let mCount = upperDelta - lowerDelta + 1;
        let len = this.$data.items.length - 1;
        // TODO if overflow==true

        // if overflow==false
        let lower = mIndex + lowerDelta;
        if (lower < 0) lower = 0;

        let upper = mIndex + upperDelta;
        if (upper > len) upper = len;

        // make at least count elements visible
        // TODO
        if (lower > len - mCount) lower = upper - (mCount - 1);

        if (upper < mCount - 1) upper = lower + mCount - 1;

        // set selectedOffset to show correct selected item
        this.$data.selectedOffset = lower;

        return this.$data.items.slice(lower, upper + 1);
      },
      setPosition: function (x = 0, y = 0, z = 0) {
        return '' + x + ' ' + y + ' ' + z;
      },
      updateSelection: function (newVal, oldVal) {
        var _old = app.$refs.listView.childNodes[oldVal];
        var _new = app.$refs.listView.childNodes[newVal];

        if (_old) _old.emit('mouseleave');
        if (_new) _new.emit('mouseenter');

        // emit events to hint
        if (newVal < oldVal) { this.onThat(newVal, 'change-dec'); }
        if (newVal > oldVal) { this.onThat(newVal, 'change-inc'); }

        if (newVal > -1) {
          app.onItemClicked();
        }
      }
    }
  });

  // -----------------------------------------

  var decreaseAction = direction == 'row' ? invertControls ? 'player-move-forward' : 'player-move-backward' : invertControls ? 'player-strafe-right' : 'player-strafe-left';
  var increaseAction = direction == 'row' ? invertControls ? 'player-move-backward' : 'player-move-forward' : invertControls ? 'player-strafe-left' : 'player-strafe-right';

  app.$el.addEventListener(decreaseAction, throttleFinally(function (e) {
    if (e.detail.second) return;

    app.$data.selectedIndex--;
  }, 50, function (e) {
    e.stopPropagation(e);
    forceStopPlayerMovement();
  }));

  app.$el.addEventListener(increaseAction, throttleFinally(function (e) {
    if (e.detail.second) return;

    app.$data.selectedIndex++;
  }, 50, function (e) {
    e.stopPropagation(e);
    forceStopPlayerMovement();
  }));

  return app;
}
