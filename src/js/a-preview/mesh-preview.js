import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {querySelectorAll} from '../utils/selector-utils';
import {cloneMeshMaterial, scaleEntity} from '../utils/aframe-utils';

/**
 * A component that renders parts of an entity or mesh inside a preview element.
 * This can be used to create lists of selectable parts.
 *
 *
 * TODO use the cache option
 *
 *
 */

AFRAME.registerComponent('mesh-preview', {
  schema: {
    scalingFactor: {type: 'number', default: 1}, // TODO have an additional option => cover contain where scaling is deendent on size of mesh and container
    selector: {type: 'string', default: 'a-simple-car'},
    'part-selector': {type: 'string', default: null}, // the sub-selector for a certain part of an entity {@link AFRAME.nk.querySelectorAll}
    'clone-material': {type: 'boolean', default: true},
    'use-cache': {type: 'boolean', default: true} // TODO one use case for cache would be the listview where only some elemnts are visible and aremanipulated by the user resulting in themesh to reload when navigating through the list
  },
  init: function () {
    this.createPreview();
  },
  remove: function () {
    if (this.vm) {
      this.vm.$el.removeObject3D('preview-mesh');
    }
  },
  update: function () {
    // TODO optimize by only removing if selectors changed

    if (this.vm) {
      this.vm.$el.removeObject3D('preview-mesh');

      this.vm.$el.parentElement.removeChild(this.vm.$el);

      this.vm = null;
    }
    this.createPreview();
  },

  createPreview: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    let template = `
        <a-entity class="preview-el" dummy-raycaster> 
        <a-torus arc="350" radius="0.3" radius-tubular="0.01"
                color="teal" position="0 .45 0" 
                 animation="property:rotation;from:0 0 0;to:0 0 360;dur:5000;easing:linear;loop:true"></a-torus>
        </a-entity>
        `;

    var that = this;
    var el = createHTML(template);

    this.vm = new Vue({
      el: el,
      data: this.data,
      methods: {
        /* onContainerClick: function (e) {
                                                    AFRAME.nk.toast('clicked container');
                                                } */
      }
    });

    this.el.append(this.vm.$el);

    // ------------------------------

    const loadModel = () => {
      let els = document.querySelectorAll(this.data.selector).toArray();

      if (els.length == 0 || els[0].object3D.children.length == 0) {
        setTimeout(loadModel, 500);
        return;
      }
      // clear loading indicator
      this.vm.$el.innerHTML = '';

      // ---------------------------------
      let model;
      if (this.data['part-selector']) {
        let subQueryResult = querySelectorAll(els[0], this.data['part-selector']);
        // console.log('part-selector result', this.data.selector, this.data['part-selector'], subQueryResult);
        if (subQueryResult.length > 0) {
          model = subQueryResult[0];
        } else {
          this.vm.$el.innerHTML = `<a-text value="part error"  text="align: center;anchor: center;" ></a-text>`;
          return;
        }
      } else {
        let selectedObjects = els.map(el => el.object3D);// AFRAME.nk.querySelectorAll(els[0], '.Mesh').map(m => m.parent);
        model = selectedObjects[0];
      }

      var newModel = model.clone();
      if (this.data['clone-material']) {
        newModel.material = cloneMeshMaterial(newModel);

        // FIXME cloning materials will prevent the bug with mesh review but will make materials not settable in config dialog
        newModel.traverse(function (o) {
          o.material = cloneMeshMaterial(o);
        });

        // let materialComponent = this.el.components.material;
        // if (materialComponent)materialComponent.material = newModel.material;
      }

      newModel.position.set(0, 0, 0); // reset position of cloned root
      newModel.scale.set(1, 1, 1);
      newModel.quaternion.set(0, 0, 0, 1);// TODO sometimes we might want to retain the rotations

      this.vm.$el.setObject3D('preview-mesh', newModel);

      scaleEntity(this.vm.$el, this.data.scalingFactor, 'preview-mesh');
    };

    loadModel();
  }

});
