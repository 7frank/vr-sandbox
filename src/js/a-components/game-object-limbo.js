
import { setPosition} from '../utils/aframe-utils';

AFRAME.registerComponent('game-object-limbo', {
  schema: {
    respawn: {
      type: 'vec3', default: {x: 0, y: 0, z: 0}
    }
  },

  init: function () {
    var that = this;

    this.el.addEventListener('collide', function (e) {
      var targetEl = e.detail.body.el;
      setPosition(targetEl, '0 10 0');
    });
  }

});
