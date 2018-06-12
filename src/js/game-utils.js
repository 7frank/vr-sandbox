import $ from 'jquery';
import * as CANNON from 'cannon';

export function getPlayer () {
  return $('.player').get(0);
}

export function getCursor () {
  return document.querySelector('[cursor]') || document.querySelector('[mouse-cursor]');
}

export function getCursorComponent () {
  let c = getCursor();
  return c.components['cursor'] || c.components['mouse-cursor'];
}

// TODO only works for cursor and mouse cursor
export function getIntersectedEl () {
  let c = getCursorComponent();
  return c.intersectedEl || c._intersectedEl;
}

// FIXME
export function getBall () {
  return $('.ball').get(0);
}

export
function playerKickBall () {
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

export
function activateJetpack () {
  var player = getPlayer();
  /* el.body.applyImpulse(
                                                                          // impulse  new CANNON.Vec3(0, 1, 0),
                                                                          // world position  new CANNON.Vec3().copy(el.getComputedAttribute('position'))
                                                                        );
                                                                        */
  var el = player; // partially works with ball but not with player body as it seems
  el.body.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, -1, 0)); // new CANNON.Vec3().copy(el.getComputedAttribute('position')));
}
