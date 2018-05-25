import _ from 'lodash';
import {createListView} from './gui-list-view';
import {Logger} from '../../utils/Logger';

var console = Logger.getLogger('gui-mesh-list');

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
      .map(function (mesh, key) {
        //  return { key: mesh.el.id || mesh.name || mesh.el.tagName.toLowerCase(), value: mesh}
        return { key: mesh.el.id || mesh.name || mesh.el.tagName.toLowerCase(), value: key};
      })
      .value();

    console.log('gui-mesh-list', items);
    // --------------------
    //  :background-color="item.value.material.color"
    var app = createListView(items, `<a-gui-button
              v-for="(item, index) in items"
              :value="item.key"
            
              width="2.5"
              height=".5"
              font-family="Arial"
              margin="0 0 0 0"
              @interaction-pick.stop="onItemClicked(item)"
              ></a-gui-button>`);

    this.el.append(app.$el);

    app.$el.addEventListener('change', (e) => {
      e.stopPropagation();

      console.log('gui-mesh-list', e.detail.value);
      console.log('gui-mesh-list', meshObjects[e.detail.value]);

      this.el.emit('change-todo', {value: meshObjects[e.detail.value]});
    });
  }

});
