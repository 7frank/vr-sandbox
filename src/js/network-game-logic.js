/**
 * lets add some simple peer-to-peer game play just for interaction
 * -in later stages we need to add a - micro service - game server like lance-gg or colyseus
 *
 *
 *
 */

import { toast} from './utils/aframe-utils';
import {getPlayer} from './game-utils';

const MessageTypes = {
  playerHealthChange: 'player-health-change'
};

export
function broadcastPlayerHealthChange (clientID, health) {
  const NAF = window.NAF;
  console.log('broadcastPlayerDeath', clientID);

  NAF.connection.broadcastDataGuaranteed(MessageTypes.playerHealthChange, {clientID, health});
}

export
function addNetworkListeners () {
  const NAF = window.NAF;
  NAF.connection.subscribeToDataChannel(MessageTypes.playerHealthChange, (fromClientId, dataType, data) => {
    console.log(MessageTypes.playerHealthChange, fromClientId, dataType, data);

    if (data.health <= 10) { setPlayerIsDead(); }
  });
  // NAF.connection.unsubscribeToDataChannel(dataType)
}

function setPlayerIsDead () {
  // rot 90degree
  // set state
  // disable movement
  // show hud menu respawn?

  toast('respawn in 5');

  let playerEl = getPlayer();
  let controls = playerEl.components['look-controls'];
  controls.pause();

  // Todo use c-controls to unify them for mobile and desktop
  let moveControls = playerEl.components['customizable-wasd-controls'];
  moveControls.pause();

  let r = playerEl.object3D.rotation;
  r.setFromVector3(new THREE.Vector3(0, 0, 1));

  respawnPlayer(playerEl);
}

export function respawnPlayer (playerEl, timeout = 5000) {
  setTimeout(() => {
    playerEl.removeAttribute('spawn-in-circle');
    playerEl.setAttribute('spawn-in-circle', 'radius:5');

    let controls = playerEl.components['look-controls'];
    controls.play();

    // Todo use c-controls to unify them for mobile and desktop
    let moveControls = playerEl.components['customizable-wasd-controls'];
    moveControls.play();

    let r = playerEl.object3D.rotation;
    r.setFromVector3(new THREE.Vector3(0, 1, 0));
  }, timeout);
}
