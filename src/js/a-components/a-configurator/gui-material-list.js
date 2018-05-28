import _ from 'lodash';
import {createListView} from './gui-list-view';

/**
 * Simple material list which takes a list of selectors from which the materials are taken
 * Note: default selection of color is triggered by action: "interaction-pick" not click event
 *
 *
 */

AFRAME.registerComponent('gui-material-list', {
  schema: {
    items: {type: 'array', default: []},
    selectors: {type: 'array', default: ['a-scene']}
  },

  tick: function () {
    // TODO billboard stays not 100% in place when moving
    // TODO refactor into "billboard-cheap"
    // this.el.object3D.setRotationFromQuaternion(document.querySelector('[camera]').object3D.quaternion);
  },
  init: function () {
    var y = this.data.selectors.join(',');
    var x = document.querySelectorAll(y)[0]; // FIXME foreach

    // query and clone materials
    var materialObjects = _.uniq(AFRAME.nk.querySelectorAll(x, '[material]').map((mesh) => mesh.material)).slice(0, 150);
    window.mat = materialObjects;
    materialObjects = _(materialObjects).compact()
      .map((material) => material.clone && material.type != 'SpriteMaterial' ? material.clone() : undefined) // TODO support multimaterial
      .compact()
      .value().slice(0, 15);
    // --------------------
    var items = _(materialObjects)
      .map((value, key) => ({
        key: key, value: value.color // value
      }))
      .value();

    // --------------------

    this.vm = createListView(items, `<a-button  
              v-for="(item, index) in items"
               :position="setPositionFromIndex(index,10,2,1,1)"
              :value="index"      
              :background-color="item.color"
              width=".5" 
              height=".5" 
              font-family="Arial" 
              margin="0 0 0 0" 
              @interaction-pick.stop="onItemClicked(item)"         
              ></a-button>`, 'row', '<a-entity></a-entity>');

    this.el.append(this.vm.$el);

    /* app.$el.addEventListener('change', (e) => {
      e.stopPropagation();
      this.el.emit('change', {material: e.detail.value});
    });

    */

    this.vm.$el.addEventListener('change', (e) => {
      e.stopPropagation();

      console.log('gui-material-list', e.detail.key);
      console.log('gui-material-list', materialObjects[e.detail.key]);

      this.el.emit('change-todo', {value: materialObjects[e.detail.key]});
    });
  },
  remove () {
    this.el.removeChild(this.vm.$el);
  }

});
