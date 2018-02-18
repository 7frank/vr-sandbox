import $ from 'jquery';
import * as _ from 'lodash';

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

/**
 * TODO implement instanceLimit primarily to prevent console logs
 *
 * @param assetSelector
 * @param duration
 * @param instanceLimit
 */
// var currentlyPlaying = {};
export function playSound (assetSelector, duration = -1, instanceLimit = 1) {
  // if (currentlyPlaying[assetSelector] == undefined) currentlyPlaying[assetSelector] = 0;
//  console.log(assetSelector, currentlyPlaying[assetSelector]);
  // if (instanceLimit > 0 && currentlyPlaying[assetSelector] >= instanceLimit) return;

  // currentlyPlaying[assetSelector]++;

  $.each($(assetSelector), function () {
    this.components.sound.playSound();

    // listen to sound ended event
    //  this.components.sound.el.addEventListener('sound-ended', function () {
    //   currentlyPlaying[assetSelector]--;
    //  });
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

export function findClosestEntity (targetSelector, selector = '.player', minDistance = Infinity) {
  var player = document.querySelector(selector);
  var targets = document.querySelectorAll(targetSelector);
  var p = player.object3D.position;

  function getDir (ball) {
    var b = ball.object3D.position;
    var direction = p.clone().sub(b);

    return direction;
  }

  targets =
        Array.prototype.slice.call(targets, 0);

  // FIXME this might be broken .. clarify and refactor
  function sortByDistanceBetween (entityA, entityB) {
    return getDir(entityA).length() >= getDir(entityB).length();
  }

  targets.sort(sortByDistanceBetween);

  // check if min distance applies here

  if (minDistance < Infinity) {
    if (getDir(targets[0]).length() > minDistance) {
      return null;
    }
  }

  return targets[0];
}

export function addScript (src, load) {
  var s = document.createElement('script');
  s.onload = load;
  s.setAttribute('src', src);
  document.body.appendChild(s);
  return s;
}

/**
 * TODO have a toast stack component that handles hiding events and animations
 *
 *
 * @param msg
 * @param action
 */

export function toast (msg, action) {
  // TODO get element that owns the current camera, maybe via event or a convention
  var el = $('.player').get(0);

  var actionParam = '';
  if (action) {
    actionParam = `action="${action}"`;
  }
  var t = `<a-entity class="toast-wrapper"><a-toast message="${msg}" ${actionParam}></a-toast></a-entity>`;
  console.log(t);
  el.insertAdjacentHTML('beforeend', t);

  var wrappers = [...el.querySelectorAll('.toast-wrapper')];

  var i = -0.5;

  for (let item of wrappers.reverse()) {
    item.setAttribute('position', `0 ${i} 1`);
    i += 0.15;
  }
}

/**
 * simple templating helper
 * for reference see Mod of Douglas Crockford's String.prototype.supplant
 * example: template("hello {test}")({test:"world"})
 */

export function template (str) {
  return function template (o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  };
}

/**
 * {@link https://stackoverflow.com/a/14251013}
 * Looks at and orients an object.
 */
export function lookAtAndOrient (objectToAdjust,
  pointToLookAt,
  pointToOrientXTowards) {
  // First we look at the pointToLookAt

  // set the object's up vector
  var v1 = pointToOrientXTowards.position.clone().sub(objectToAdjust.position).normalize(); // CHANGED
  var v2 = pointToLookAt.clone().sub(objectToAdjust.position).normalize(); // CHANGED
  var v3 = new THREE.Vector3().crossVectors(v1, v2).normalize(); // CHANGED
  objectToAdjust.up.copy(v3); // CHANGED

  objectToAdjust.lookAt(pointToLookAt);

  // QUESTION HERE:
  // Now, we need to rotate the object around its local Z axis such that its X axis
  // lies on the plane defined by objectToAdjust.position, pointToLookAt and pointToOrientXTowards

  // objectToAdjust.rotation.z = ??;
}

// actually quite trivial but oh well sometimes...
// see http://www.mrspeaker.net/2013/03/06/opposite-of-lookat/
export function lookAwayFrom (me, target) {
  var v = new THREE.Vector3();
  v.subVectors(me.position, target.position).add(me.position);
  me.lookAt(v);
}
