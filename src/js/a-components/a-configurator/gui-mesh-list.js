import _ from 'lodash';
import {createListView} from './gui-list-view';

/**
 * Simple mesh list which creates a list of all entities that do have a mesh attached
 *
 *
 */

AFRAME.registerComponent('gui-mesh-list', {
  schema: {
    // items: {type: 'array', default: ['a-scene']}
  },
  init: function () {
    console.log('gui-mesh-list');

    // TODO
    var meshObjects = _.uniq(AFRAME.nk.querySelectorAll(this.el.parentEl.parentEl, '.Mesh:where(el)'));// .map((mesh) => mesh.material)).slice(0, 15);
    console.log('gui-mesh-list', meshObjects);
    // --------------------
    var items = _(meshObjects)
      .map((mesh, key) => ({
        // key: mesh.el.id ? mesh.el.id : mesh.el.tagName.toLowerCase(), value: mesh
        key: mesh.el.id || mesh.name || mesh.el.tagName.toLowerCase(), value: mesh
      }))
      .value();

    console.log('gui-mesh-list', items);
    // --------------------

    var app = createListView(items, `<a-gui-button  
              v-for="(item, index) in items"
              :value="item.key"      
              :background-color="item.value.material.color"
              width="2.5" 
              height=".5" 
              font-family="Arial" 
              margin="0 0 0 0" 
              @interaction-pick.stop="onItemClicked(item)"         
              ></a-gui-button>`);

    this.el.append(app.$el);

    /* app.$el.addEventListener('change', (e) => {
      e.stopPropagation();

      this.el.emit('change', {value: e.detail.value});
    }); */
  }

});
