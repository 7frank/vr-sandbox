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
    <ui-textbox v-model="localPlayerName" @change="updateLocalPlayerName" placeholder="Enter your name." >stats</ui-textbox>
    <ui-textbox v-model="localPlayerMessage" @keydown="updateLocalPlayerMessage" placeholder="Say something." >stats</ui-textbox>
    </div>
  `);

    // vue -------------------------------------
  var app = new Vue({
    el: el,
    data: {
      showStats: false,
      localPlayerName: null,
      localPlayerMessage: null
    },
    methods: {
      toggleShowDebug: function () {
        var scene = document.querySelector('a-scene');
        if (this.$data.showStats) {
          scene.setAttribute('stats', true);
        } else {
          scene.removeAttribute('stats');
        }
      },
      updateLocalPlayerName: function () {
        var playerName = document.querySelector('#player .name');

        var tagName = playerName.components['networked-name-tag'];

        tagName.data.name = this.$data.localPlayerName;
        tagName.update();
      },
      updateLocalPlayerMessage: function () {
        // TODO use and sync native text component instead
        var playerName = document.querySelector('#player .say');

        var tag = playerName.components['networked-tag'];

        tag.data.name = this.$data.localPlayerMessage;
        tag.update();
      }
    }
  });

  return app;
}
