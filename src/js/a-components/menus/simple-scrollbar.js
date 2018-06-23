/**
 find out where trackedcontrols system... is located
 find out what happens to the not rendered hud and if it is rendered somewhere else
 create scrollbar component and make video!!

 */
import Vue from 'vue/dist/vue.esm';
import {createHTML} from '../../utils/dom-utils';
import {getCursorComponent} from '../../game-utils';
import * as _ from 'lodash';

// TODO same as with gui-list view arrows, have a visual component that handles inc dec of stuff
const scrollbarFactory = ` <a-plane height="0.1" width="1" color="grey">
              <a-plane height="0.05" width=".05" color="lightgrey" position="-.45 0 .01" ref="button_l"  @interaction-pick.stop="onButtonClicked(-1)"   ></a-plane>
             
                  <a-plane color="lightgrey" height="0.05" width=".8"  position="0 0 .01" ref="track"  @interaction-pick.stop="onTrackDrag">
                    <a-plane color="slateblue" height="0.05" width=".05" :position="thumbPosition" ref="thumb"  @interaction-pick.stop="onDrag"></a-plane>
                  </a-plane>
              
              <a-plane height="0.05" width=".05" color="lightgrey" position=".45 0 .01" ref="button_r"  @interaction-pick.stop="onButtonClicked(1)"   ></a-plane>
            </a-plane>`;

AFRAME.registerComponent('simple-scrollbar', {
  schema: {

    position: {type: 'number', default: 30},
    min: {type: 'number', default: 0},
    max: {type: 'number', default: 100},

    orientation: {type: 'string', default: 'column'}, // the orientation of the controls up/down== row left/right==column

    factory: {type: 'string', default: scrollbarFactory}// html string that relies on vue attributes
  },
  update: function (oldData) {

  },
  init: function () {
    // init the actual view model
    this.initViewModel();
  },
  initViewModel: function () {
    var component = this;

    // remove previous vm
    if (this.vm) {
      this.vm.$el.parentElement.removeChild(this.vm.$el);
      this.vm = null;
    }

    var el = createHTML(this.data.factory);

    // vue -------------------------------------

    this.vm = new Vue({
      el: el,

      data: this.data,

      methods: {
        onButtonClicked: function (directionValue) {
          this.$data.position += directionValue;
          if (this.$data.position < this.$data.min) this.$data.position = this.$data.min;
          if (this.$data.position > this.$data.max) this.$data.position = this.$data.max;
        },
        onTrackDrag: function (...args) {
          let lastIntersection = getCursorComponent().intersectedEventDetail;
          let rc = document.querySelector('[cursor]').components['raycaster'];

          console.log('onTrackDrag', args, lastIntersection, rc.intersections);

          this.$data.position = _.random(this.$data.min, this.$data.max);

          // for starters: set position value to drag position
        },
        onDrag: function (...args) {
          console.log('onDrag', args);
        }

      },
      computed: {
        thumbPosition: function () {
          let {min, max, position} = this.$data;
          let pct = (position - min) / (max - min);
          component.el.emit('change', {min, max, position}, false);

          // TODO position and width currently static
          return `${(pct - 0.5) * 0.75} 0 .01`;
        }

      }
    });

    this.el.appendChild(this.vm.$el);
  },
  remove () {
    if (this.vm) {
      this.vm.$el.parentElement.removeChild(this.vm.$el);
      this.vm = null;
    }
  }

});
