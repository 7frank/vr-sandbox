import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';

AFRAME.registerComponent('mesh-preview', {
  schema: {},
  init: function () {
    this.createPreview();
  },

  createPreview: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    let template = `
        <a-entity dummy-raycaster @interaction.pick="onContainerClick"></a-entity>
        
        `;

    var that = this;
    var el = createHTML(template);

    this.vm = new Vue({
      el: el,
      data: this.data,
      methods: {
        onContainerClick: function (e) {
          AFRAME.nk.toast('clicked container');
        }
      }
    });

    this.el.append(this.vm.$el);

    // ------------------------------
    // TODO on focus rotate on blur stop rotation

    const loadModel = () => {
      let els = document.querySelectorAll('a-simple-car').toArray();

      if (els.length == 0 || els[0].object3D.children.length == 0) {
        console.log(els);
        setTimeout(loadModel, 500);
        return;
      }

      let selectedObjects = els.map(el => el.object3D);// AFRAME.nk.querySelectorAll(els[0], '.Mesh').map(m => m.parent);
      let model = selectedObjects[0];
      var newModel = model.clone(true);
      newModel.position.set(0, 0, 0);

      this.vm.$el.object3D.add(newModel);
    };

    loadModel();
  }

});
