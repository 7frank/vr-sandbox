
import $ from 'jquery';

const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

export function setPosition (el, v) {
  var arr = v.split(' ');

  var v2 = {x: Number(arr[0]), y: Number(arr[1]), z: Number(arr[2])};
  console.log(v);
  if (el.body != null && el.body.position != null) {
    el.body.position.copy(v2);
    el.body.velocity.set(0, 0, 0);
  } else el.setAttribute('position', v);
}

export function playSound (assetSelector, duration = -1) {
  $.each($(assetSelector), function () {
    this.components.sound.playSound();
  });

  if (duration > 0) {
    setTimeout(function () {
      $.each($(assetSelector), function () {
        this.components.sound.stopSound();
      });
    }, duration);
  }
}

// FIME direction seems to be inverted
export function getDirectionForEntity (entity) {
  var o3d = entity.object3D;
  var pos = o3d.position;
  var up = o3d.up;
  var quaternion = o3d.quaternion;
  var direction = new THREE.Vector3().copy(up);
  direction.applyQuaternion(quaternion);
  return direction;
}

export function findClosestEntity (targetSelector, selector = '.player') {
  var player = document.querySelector(selector);
  var targets = document.querySelectorAll(targetSelector);
  var p = player.object3D.position;

  function getDir (ball) {
    var b = ball.object3D.position;
    var direction = p.sub(b);

    return direction;
  }
  targets =
        Array.prototype.slice.call(targets, 0);
  targets.sort(function (entityA, entityB) {
    return getDir(entityA).length() >= getDir(entityB).length();
  });

  return targets[0];
}
