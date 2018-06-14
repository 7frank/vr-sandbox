
import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './main-menu.hbs';

AFRAME.registerComponent('hud-main-menu', {
  schema: {},
  init: function () {
    this.createDialog();
  },

  createDialog: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    var that = this;
    var el = createHTML(template());

    /*    this.vm = new Vue({
      el: el,
      data: this.data,
      methods: {
        onOkClick: function (e) {
          // that.el.parentElement.removeChild(that.el);
        }
      }
    }); */

    this.el.append(el);
    // this.el.append(this.vm.$el);
  }

});
