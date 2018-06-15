import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {querySelectorAll} from '../utils/selector-utils';
import {scaleEntity} from '../utils/aframe-utils';

/**
 * A component that renders parts of an entity or mesh inside a preview element.
 * This can be used to create lists of selectable parts.
 */

AFRAME.registerComponent('mesh-preview', {
  schema: {
    scalingFactor: {type: 'number', default: 1},
    selector: {type: 'string', default: 'a-simple-car'},
    'part-selector': {type: 'string', default: null}// the sub-selector for a certain part of an entity {@link AFRAME.nk.querySelectorAll}
  },
  init: function () {
    this.createPreview();
  },

  createPreview: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    let template = `
        <a-entity class="preview-el" dummy-raycaster></a-entity>
        
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

      // TODO have a placeholder while loading
      if (els.length == 0 || els[0].object3D.children.length == 0) {
        setTimeout(loadModel, 500);
        return;
      }
      // ---------------------------------
      let model;
      if (this.data['part-selector']) {
        let subQueryResult = querySelectorAll(els[0], this.data['part-selector']);
        if (subQueryResult.length > 0) { model = subQueryResult[0]; }
      } else {
        let selectedObjects = els.map(el => el.object3D);// AFRAME.nk.querySelectorAll(els[0], '.Mesh').map(m => m.parent);
        model = selectedObjects[0];
      }

      var newModel = model.clone(true);
      newModel.position.set(0, 0, 0);

      this.vm.$el.setObject3D('preview-mesh', newModel);

      scaleEntity(this.vm.$el, this.data.scalingFactor, 'preview-mesh');
    };

    loadModel();
  }

});
