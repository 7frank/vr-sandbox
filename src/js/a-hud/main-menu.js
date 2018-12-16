import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './main-menu.hbs';
import listTemplate from './main-menu-list.hbs';
import {MainMenuStack} from '../types/MenuStack';
import {getWorld} from '../game-utils';
import {loadStaticRegionDemo} from '../region-utils';
import {User as defaultUser} from '../database-utils';

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
        case 'Start':
          MainMenuStack.push('player-hud');
          loadStaticRegionDemo();
          break;
        case 'Load':
          MainMenuStack.push('region-select-menu');
          break;
        case 'Login':
          defaultUser.login();
          break;
        case 'Config':
          MainMenuStack.push('sample-config-menu');
          break;
        case 'About':
          MainMenuStack.push('about-menu');
          break;
        case 'ToS':
          MainMenuStack.push('flow-test-menu');
          break;
      }

      console.error('list picked', arguments);
    });

    this.vm.$el.append(listEl);
    this.el.append(this.vm.$el);
  }

});
