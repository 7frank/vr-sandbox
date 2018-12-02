import $ from 'jquery';
import * as CANNON from 'cannon';
import {
  _setPosition, getClosestEditableRegion, getWorldDirection, getWorldPosition,
  teleportPhysicsBody
} from './utils/aframe-utils';

// the local player
export function getPlayer () {
  return $('#player').get(0);
}

export function getAssets () {
  return getPlayer().sceneEl.querySelector('a-assets');
}

export function getScene () {
  return getPlayer().sceneEl;
}

export function getHUD () {
  return getPlayer().querySelector('#mainHUD');
}

export function getWorld () {
  return getPlayer().sceneEl.querySelector('#regions-container');
}

/**
 *
 * all players that are connected to the network
 * FIXME performance listen to network and refresh list only on changes
 *
 */
export function getPlayers () {
  return document.querySelectorAll('[networked]').toArray().filter(a => a.components.networked.data.template == '#avatar-template');
}

/**
 * retrieves the entity that has the cursor component attached
 */
export function getCursor () {
  return document.querySelector('[cursor]');
}

export function getCursorComponent () {
  let c = getCursor();
  return c.components['cursor'];
}

export function getIntersectedEl () {
  let c = getCursorComponent();
  return c.intersectedEl;
}

/**
 *
 *
 * @param targetEl
 * @param distance
 */
export function getPositionInFrontOfEntity (targetEl, distance = 5, maintainSameY = true) {
  let pos = getWorldPosition(targetEl.object3D);
  let dir = getWorldDirection(targetEl.object3D);

  // TODO relative to regions and targetEl
  if (maintainSameY) {
    dir.y = 0;
    dir.normalize();
  }

  let targetPos = pos.clone(pos).add(dir.multiplyScalar(-distance));

  return targetPos;
}

// FIXME
export function getBall () {
  return $('.ball').get(0);
}

export function playerKickBall () {
  var player = getPlayer();
  var ball = getBall();

  /* el.body.applyImpulse(
                                                                            // impulse  new CANNON.Vec3(0, 1, 0),
                                                                            // world position  new CANNON.Vec3().copy(el.getComputedAttribute('position'))
                                                                          );
                                                                          */
  var p = player.body.position;
  var b = ball.body.position;

  var direction = p.vsub(b);

  if (direction.length() < 5) {
    var velo = ball.body.velocity.addScaledVector(1, direction.negate());
    ball.body.velocity.copy(velo);
  }
}

export function activateJetpack () {
  var player = getPlayer();
  /* el.body.applyImpulse(
                                                                            // impulse  new CANNON.Vec3(0, 1, 0),
                                                                            // world position  new CANNON.Vec3().copy(el.getComputedAttribute('position'))
                                                                          );
                                                                          */
  var el = player; // partially works with ball but not with player body as it seems
  el.body.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, -1, 0)); // new CANNON.Vec3().copy(el.getComputedAttribute('position')));
}
