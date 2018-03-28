/**
 *
 */

import Vue from 'vue/dist/vue.esm';
import {createHTML} from '../../utils/dom-utils';

export function createOptions (camera) {
  // datasource -------------------------------------

  // template -------------------------------------
  var el = createHTML(`
  <div>
  
 
    <ui-switch v-model="showStats" @change="toggleShowDebug" >stats</ui-switch>
  
    </div>
  `);

    // vue -------------------------------------
  var app = new Vue({
    el: el,
    data: {
      showStats: false
    },
    methods: {
      toggleShowDebug: function () {
        var scene = document.querySelector('a-scene');
        if (this.$data.showStats) { scene.setAttribute('stats', true); } else { scene.removeAttribute('stats'); }
      }
    }
  });

  return app;
}
