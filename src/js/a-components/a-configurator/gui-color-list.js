import _ from 'lodash';
import {createListView} from './gui-list-view';
import {createHTML} from '../../utils/dom-utils';

/**
 * Simple color select with accent colors.
 * Note: default selection of color is triggered by action: "interaction-pick" not click event
 *
 *
 */

AFRAME.registerComponent('gui-color-list', {
  schema: {
    items: {type: 'array', default: []}
  },
  init: function () {
    this.mList = createHTML(`<nk-list-view order-as="grid: 2 5 .5 .25">
        <a-circle
                v-for="(item, index) in items"
                :color="item.value"
                :position="setPositionFromIndex(index,5,1,1,1)"
                radius=.45

                @interaction-pick.stop="onItemClicked(index)"
        >
            <a-ring v-if="selectedIndex==index" position="0 0 -0.01" scale=".5 .5 .5" radiusOuter=0.47 radiusInner="0.45"  color="white" material="shader: flat;"></a-ring>
        </a-circle>
        <!--<template>[{key:1,value:"red"},{key:1,value:"blue"},{key:1,value:"yellow"}]</template>-->
    </nk-list-view>  
`);

    this.el.append(this.mList);
    // ------------------------------

    // TODO is there a way to set items without the timeout?
    setTimeout(() => {
      var demoColors = {
        'Magenta': '255,0,151',
        'Purple': '162,0,255',
        'Teal': '0,171,169',
        'Lime': '140,191,38',
        'Brown': '160,80,0',
        'Pink': '230,113,184',
        'Orange': '240,150,9',
        'Blue': '27,161,226',
        'Red': '229,20,0',
        'Green': '51,153,51'

      };

      var items;

      if (this.data.items.length <= 0) {
        items = _(demoColors)
          .map((value, key) => ({
            key: key, value: `rgb(${value})`
          }))
          .value();
      } else {
        items = _(this.data.items)
          .map((value, key) => ({
            key: key, value: new THREE.Color(value).toJSON().toString(16)
          }))
          .value();
      }
      // --------------------

      this.mList.components['gui-list-view'].setItems(items);
    }, 1);

    /*
    colorList.addEventListener('change', (e) => {
      e.stopPropagation();
      this.el.emit('change', {color: e.detail.value});
    });

    */
  },
  remove: function () {
    this.el.removeChild(this.mList);
  }

});
