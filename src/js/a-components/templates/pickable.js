/**
 * add to be able to configure an entity when pressing <interaction-talk>
 *
 */
import {getPlayer, placeInFrontOfEntity} from '../../game-utils';

AFRAME.registerComponent('pickable', {
  schema: {},

  init: function () {
    // TODO data.parameters foreach gui-element
    this.isPickedUp = false;

    this.mHandler1 = (e) => {
      e.stopPropagation();

      this.isPickedUp = !this.isPickedUp;
    };

    this.el.addEventListener('interaction-pick', this.mHandler1);
  },
  tick: function () {
    if (this.isPickedUp) {
      placeInFrontOfEntity(this.el, getPlayer(), 4, false);
    }
  },
  remove: function () {
    this.el.removeEventListener('interaction-pick', this.mHandler1);
  }

});
