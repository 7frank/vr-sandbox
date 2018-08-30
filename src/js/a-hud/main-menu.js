import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './main-menu.hbs';
import listTemplate from './main-menu-list.hbs';
import {showMenu} from '../utils/debug-gui';

AFRAME.registerComponent('hud-main-menu', {
  schema: {},
  init: function () {
    this.createDialog();
  },

  createDialog: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    var that = this;
    var el = createHTML(template());

    this.vm = new Vue({
      el: el,
      data: this.data,
      methods: {
        onStartClick: function (e) {
          // alert('start');
        }
      }
    });

    var listEl = createHTML(listTemplate());

    listEl.addEventListener('selected', function ({detail}) {
      var hud = document.querySelector('[hud-hud]');

      switch (detail.value) {
        case 'Start':showMenu(hud, 'player-hud'); break;
        case 'Load':showMenu(hud, 'region-select-menu'); break;
        case 'Config':showMenu(hud, 'sample-config-menu'); break;
        case 'About':showMenu(hud, 'about-menu'); break;
        case 'ToS':showMenu(hud, 'flow-test-menu'); break;
      }

      console.error('list picked', arguments);
    });

    this.vm.$el.append(listEl);
    this.el.append(this.vm.$el);
  }

});
