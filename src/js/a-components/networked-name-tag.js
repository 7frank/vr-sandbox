import {createTerrain} from '../utils/terrain-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';

/**
 * sets the name or if none is given the networkId
 * @param name
 */
function setLocalActorName (name) {
  var player = document.querySelector('.player');

  var networked = player.components.networked;
  if (!networked) console.error("can't set local actor name... not networked");

  var id = networked.data.networkId;

  var myNametag = player.querySelector('.name');

  if (name) { myNametag.setAttribute('text', 'value', name); } else { myNametag.setAttribute('text', 'value', id); }
}

/**

 */

AFRAME.registerComponent('networked-name-tag', {
  schema: {
    name: {type: 'string', default: null}
  },
  init: function () {
    setLocalActorName();

    // this.el.object3D.add(mesh);
  },
  update: function () {
    setLocalActorName(this.data.name);
  },
  tick: function (time, timeDelta) {

  }

});

// not really necessary is it? we can simply set the text value and sync that
AFRAME.registerComponent('networked-tag', {
  schema: {
    name: {type: 'string', default: null}
  },
  init: function () {
    this.update();
  },
  update: function () {
    this.el.setAttribute('text', 'value', this.data.name);
  }

});
