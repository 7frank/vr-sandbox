
import {createTerrain} from '../utils/terrain-utils';
import {updateHotComponent} from '../utils/aframe-utils';

/**
 *  A terrain generator
 *  Note: might be used to generate terrain data which will be used for <cdlod-terrain> later
 */
updateHotComponent('procedural-terrain');
AFRAME.registerComponent('procedural-terrain', {
  schema: {

  },
  init: function () {
    console.log('procedural-terrain');

    var mesh = createTerrain();
    this.el.object3D.add(mesh);
  },
  tick: function (time, timeDelta) {

  }

});
