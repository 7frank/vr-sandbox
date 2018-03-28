import $ from 'jquery';
import * as CANNON from 'cannon';

export function getPlayer () {
  return $('.player').get(0);
}

export function getBall () {
  return $('.player').get(0);
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
  var ball = getBall();

  /* el.body.applyImpulse(
                                                                          // impulse  new CANNON.Vec3(0, 1, 0),
                                                                          // world position  new CANNON.Vec3().copy(el.getComputedAttribute('position'))
                                                                        );
                                                                        */
  var el = ball; // partially works with ball but not with player body as it seems
  el.body.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, -1, 0)); // new CANNON.Vec3().copy(el.getComputedAttribute('position')));
}
