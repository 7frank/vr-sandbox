import {toast} from '../../utils/aframe-utils';
// FIXME does not work if nws already exists
AFRAME.registerSystem('networked-listeners', {
  // dependencies: ['networked-scene'],
  schema: {},
  init: function () {
    // listen to own connection event
    document.body.addEventListener('connected', (evt) => {
      console.error('connected event. clientId =', evt.detail.clientId);

      toast('Online id:' + evt.detail.clientId, 10000);
    });

    var playerOnline = 1;

    function playerCount (dValue) {
      playerOnline += dValue;
      var pc = document.querySelector('.player-count');

      pc.setAttribute('value', 'Currently Online :' + playerOnline);
    }

    // listen to client connections and disconnections
    document.body.addEventListener('clientConnected', function (evt) {
      console.log('clientConnected', evt.detail);
      toast('Player joined id:' + evt.detail.clientId);
      playerCount(1);
    });
    document.body.addEventListener('clientDisconnected', function (evt) {
      console.log('clientDisconnected', evt.detail);
      toast('Player left id:' + evt.detail.clientId);
      playerCount(-1);
    });

    // listen to entity connections and disconnections
    document.body.addEventListener('entityCreated', function (evt) {
      console.error('entityCreated event', evt.detail);
    });
    document.body.addEventListener('entityRemoved', function (evt) {
      console.error('entityRemoved event. Entity networkId =', evt.detail);
    });

    // start network
    this.el.setAttribute('networked-scene', 'room: basic;debug: true;onConnect:__onAFrame_Network_Connect__');
  }
});

// expose to global scope for networked-scene to find
window.__onAFrame_Network_Connect__ = __onAFrame_Network_Connect__;

function __onAFrame_Network_Connect__ () {
  console.error('On connected to NAF -', new Date()); // On connected to NAF - Fri Jun 29 2018 06:54:47 GMT+0200 (Mitteleuropäische Sommerzeit)
  // Examples of listening to NAF events
}
