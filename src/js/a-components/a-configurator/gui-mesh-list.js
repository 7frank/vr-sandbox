import _ from 'lodash';
import {createListView} from './gui-list-view';
import {Logger} from '../../utils/Logger';
import {createHTML} from '../../utils/dom-utils';

var console = Logger.getLogger('gui-mesh-list');

/**
 * Simple mesh list which creates a list of all entities that do have a mesh attached
 *
 *
 */

AFRAME.registerComponent('gui-mesh-list', {
  schema: {
    target: {type: 'selector'}
  },
  init: function () {
    if (this.data.target) {
      console.log('target', this.data.target);
      this.createList(this.data.target);
    } else console.warn('gui-mesh-list target undefined');
  },
  update: function (oldData) {
    if (oldData.target != this.data.target) {
      console.log('gui-mesh-list target:', this.data.target);
      this.createList(this.data.target);
    }
  },

  createList: function (targetEl) {
    // remove previous instances
    if (this.mList) {
      // fixme a-button previous instance not cleaned
      // this.mList.querySelectorAll('a-rounded').forEach(img => img.parentElement.removeChild(img));

      this.el.removeChild(this.mList);
    }

    console.log('gui-mesh-list');

    // TODO
    // var meshObjects = _.uniq(AFRAME.nk.querySelectorAll(this.el.parentEl.parentEl, '.Mesh:where(el)'));// .map((mesh) => mesh.material)).slice(0, 15);
    var meshObjects = _.uniq(AFRAME.nk.querySelectorAll(targetEl, '.Mesh:where(el)'));

    console.log('gui-mesh-list', meshObjects);
    // --------------------

    var items = _(meshObjects)
      .map(function (mesh, key) {
        //  return { key: mesh.el.id || mesh.name || mesh.el.tagName.toLowerCase(), value: mesh}
        return {key: mesh.el.id || mesh.name || mesh.el.tagName.toLowerCase(), value: key};
      })
      .value();

    console.log('gui-mesh-list', items);
    // --------------------
    //  :background-color="item.value.material.color"

    this.mList = createHTML(`<nk-list-view orientation="row" order-as="grid: 2 5 .5 .25">
       <a-button
              v-for="(item, index) in items"
              :value="''+index+item.key"
              :position="setPositionFromIndex(index,1,10,1,1)"
              :button-color="selectedIndex==index?'slateblue':'lightgrey'"
              width="2.5"
              height=".5"
              font-family="Arial"
              margin="0 0 0 0"
              @interaction-pick.stop="onItemClicked(item)"
              ></a-button>   
    </nk-list-view>  
`);

    this.el.append(this.mList);
    setTimeout(() => {
      this.mList.components['gui-list-view'].setItems(items);

      setTimeout(() => {
        this.el.querySelectorAll('a-button').forEach(el => el.querySelector('a-entity').setAttribute('visible', false));
      }, 1);
    }, 1);

    this.mList.addEventListener('change', (e) => {
      e.stopPropagation();

      console.log('gui-mesh-list', e.detail.value);
      console.log('gui-mesh-list', meshObjects[e.detail.value]);

      this.el.emit('change-todo', {value: meshObjects[e.detail.value]});
    });
  },
  remove () {
    this.el.removeChild(this.mList);
  }

});
