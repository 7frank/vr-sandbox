import _ from 'lodash';
import {createListView} from './gui-list-view';
import {createHTML} from '../../utils/dom-utils';

/**
 * Simple material list which takes a list of selectors from which the materials are taken
 * Note: default selection of color is triggered by action: "interaction-pick" not click event
 *
 *
 */

AFRAME.registerComponent('gui-material-list', {
  schema: {
    items: {type: 'array', default: []},
    selectors: {type: 'array', default: ['a-scene']},
    dimensions: {type: 'array', default: [10, 2, 1, 1]},
    limit: {type: 'array', default: []} // default: [-3, 3]
  },
  init: function () {
    // --------------------

    if (this.data.limit.length > 0) {
      this.mList = createHTML(`<nk-list-view arrows="false" order-as="grid: 2 5 .5 .25">
        <a-rounded  
              v-for="(item, index) in getVisibleItems(${this.data.limit.join(',')})"
               :position="setPositionFromIndex(index,${this.data.dimensions.join(',')})"
              :value="index"      
            
              width="0.9" 
              height="0.9"
              radius=".2" 
              font-family="Arial" 
              :material="item.material"
              @interaction-pick.stop="onItemClicked(index)"         
              ><a-rounded v-if="isSelected(index)" position="0 0 -0.01" color="white" material="shader: flat;"></a-rounded></a-rounded>   
                </nk-list-view>  
            `);
    } else {
      this.mList = createHTML(`<nk-list-view arrows="false" order-as="grid: 2 5 .5 .25">
        <a-rounded  
              v-for="(item, index) in items"
               :position="setPositionFromIndex(index,${this.data.dimensions.join(',')})"
              :value="index"      
            
              width="0.9" 
              height="0.9"
              radius=".2" 
              font-family="Arial" 
              :material="item.material"
              @interaction-pick.stop="onItemClicked(index)"         
              ><a-rounded v-if="selectedIndex==index" position="0 0 -0.01" color="white" material="shader: flat;"></a-rounded></a-rounded>   
                </nk-list-view>  
            `);
    }

    this.el.append(this.mList);

    // ---------------------------------------

    var y = this.data.selectors.join(',');
    var x = document.querySelectorAll(y)[0]; // FIXME foreach

    // query and clone materials
    var materialObjects = _.uniq(AFRAME.nk.querySelectorAll(x, '[material]').map((mesh) => mesh.material)).slice(0, 150);
    materialObjects = _(materialObjects).compact()
      .map((material) => material.clone && material.type != 'SpriteMaterial' ? material.clone() : undefined) // TODO support multimaterial
      .compact()
      .value().slice(0, 15);
    // --------------------
    var items = _(materialObjects)
      .map((value, key) => ({
        key: key, value: value.color, material: value // value
      }))
      .value();

    setTimeout(() => {
      this.mList.components['gui-list-view'].setItems(items);
    }, 1);
    // ---------------------------------------

    /* app.$el.addEventListener('change', (e) => {
          e.stopPropagation();
          this.el.emit('change', {material: e.detail.value});
        });

        */

    this.mList.addEventListener('change', (e) => {
      e.stopPropagation();

      console.log('gui-material-list', e.detail.key);
      console.log('gui-material-list', materialObjects[e.detail.key]);

      this.el.emit('change-todo', {value: materialObjects[e.detail.key]});
    });
  },
  remove () {
    this.el.removeChild(this.mList);
  }

});
