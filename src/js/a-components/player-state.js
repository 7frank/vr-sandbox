
import {PlayerStates} from '../types/PlayerStates';

AFRAME.registerComponent('player-state', {
  schema: { type: 'string', default: 'none'
  },
  init: function () {
    this.mStates = new PlayerStates(this.el);
    console.error("FIXME don't use until refactored");
    // this.update();
  },
  update: function () {
    this.mStates.setState(this.data);
  }

});
