import _ from 'lodash';
import {createListView} from './gui-list-view';

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

  tick: function () {
    // TODO billboard stays not 100% in place when moving
    // this.el.object3D.setRotationFromQuaternion(document.querySelector('[camera]').object3D.quaternion);
  },
  init: function () {
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

    // --------------------
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

    var app = createListView(items, `<a-gui-button  
              v-for="(item, index) in items"
              value=" "      
              :background-color="item.value"
              width=".5" 
              height=".5" 
              font-family="Arial" 
              margin="0 0 0 0" 
              @interaction-pick.stop="onItemClicked(item)"         
              ></a-gui-button>`);

    this.el.append(app.$el);

    app.$el.addEventListener('change', (e) => {
      e.stopPropagation();
      this.el.emit('change', {color: e.detail.value});
    });
  }

});
