import $ from 'jquery';

export function getPosition (el) {
  if (el.body != null && el.body.position != null) {
    return new THREE.Vector3().copy(el.body.position);
  } else {
    return new THREE.Vector3().copy(el.getAttribute('position'));
  }
}

export function setPosition (el, v) {
  var arr, v2;

  if (typeof v == 'string') {
    arr = v.split(' ');

    v2 = {x: Number(arr[0]), y: Number(arr[1]), z: Number(arr[2])};
  }
  if (v instanceof THREE.Vector3) {
    v2 = v;
    v = v.x + ' ' + v.y + ' ' + v.z;
  }

  if (el.body != null && el.body.position != null) {
    teleportPhysicsBody(el.body, v2);
  } else el.setAttribute('position', v);
}

/**
 * Should teleport a physics body.
 * TODO have an option to animate path instead of teleporting
 *
 * @param {CANNON.Body} body - A cannon.js body element.
 * @param {vec3} position - A vector element with 3 degrees of freedom.
 */
export function teleportPhysicsBody (body, position) {
  body.position.copy(position);
  body.previousPosition.copy(position);
  body.interpolatedPosition.copy(position);
  body.initPosition.copy(position);

  // orientation
  body.quaternion.set(0, 0, 0, 1);
  body.initQuaternion.set(0, 0, 0, 1);
  body.interpolatedQuaternion.set(0, 0, 0, 1);

  // Velocity
  body.velocity.setZero();
  body.initVelocity.setZero();
  body.angularVelocity.setZero();
  body.initAngularVelocity.setZero();

  // Force
  body.force.setZero();
  body.torque.setZero();

  // Sleep state reset
  body.sleepState = 0;
  body.timeLastSleepy = 0;
  body._wakeUpAfterNarrowphase = false;
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

/**
 * returns a directional vector where the entity is facing
 *
 * @param entity
 * @returns {THREE.Vector3}
 */
export function getDirectionForEntity (entity) {
  var o3d = entity.object3D;

  var matrix = new THREE.Matrix4();
  matrix.extractRotation(o3d.matrix);

  var direction = new THREE.Vector3(0, 0, 1);
  matrix.multiplyVector3(direction);
  return direction;

  /* var pos = o3d.position;
          var up = o3d.up;
          var quaternion = o3d.quaternion;
          var direction = new THREE.Vector3().copy(up);
          direction.applyQuaternion(quaternion);
          return direction; */
}

/**
 *
 * @param {(selector|HTMLElement[])} targetSelector - A selector to query for elements that might be close.
 * @param (selector|HTMLElement) selector - The element that we want to find other close elements for.
 * @param {number} minDistance - if the distance between selector-Element and targetSelector-Elements is bigger than minDistance the targetSelector-Element gets discarded.
 * @returns {*}
 */
export function findClosestEntity (targetSelector, selector = '.player', minDistance = Infinity) {
  var player = typeof selector == 'string' ? document.querySelector(selector) : selector;
  var targets = typeof targetSelector == 'string' ? document.querySelectorAll(targetSelector) : targetSelector;

  if (!targets.length) throw new Error('probably invalid targetSelector');

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

/**
 * see http://www.mrspeaker.net/2013/03/06/opposite-of-lookat/
 * @param {THREE.Object3D} me - The element itself.
 * @param {THREE.Object3D} target - The element to look away from.
 */
export function lookAwayFrom (me, target) {
  var v = new THREE.Vector3();
  v.subVectors(me.position, target.position).add(me.position);
  me.lookAt(v);
}

/**
 * takes a unit vector (or should at least) and transforms it into a quaternion using an up-vector
 * @param {THREE.Vector3} mVec - The unit vector.
 * @param {THREE.Vector3} up - An up-vector.
 * @returns {THREE.Quaternion} the quaternion representing the rotation in 3D-space
 * FIXME this only works for the 0,1,0 up vector
 * @deprecated since 0.1.0
 */
export function vector2Quaternion (mVec, up = new THREE.Vector3(0, 1, 0)) {
  if (mVec.length() == 0) throw new Error('vector may not have length 0');

  let angle = Math.atan2(mVec.x, mVec.z); // Note: I expected atan2(z,x) but OP reported success with atan2(x,z) instead! Switch around if you see 90° off.
  let qx = up.x;
  let qy = up.y * Math.sin(angle / 2);
  let qz = up.z;
  let qw = Math.cos(angle / 2);
  return new THREE.Quaternion().set(qx, qy, qz, qw);
}

/**
 * returns a unsigned angle in radian between 0 and Pi
 * @param v1
 * @param v2
 * @param normalVector
 */
export function getUnsignedAngle (vectorA, vectorB) {
  // Store some information about them for below
  var dot = vectorA.dot(vectorB);
  var lengthA = vectorA.length();
  var lengthB = vectorB.length();

  // Now to find the angle "acos"
  var theta = Math.acos(dot / (lengthA * lengthB));
  return theta;
}

/**
 * returns a signed angle in radian between -Pi and Pi
 * @param v1
 * @param v2
 * @param normalVector
 */

export function getSignedAngle (v1, v2, normalVector) {
  if (normalVector == null) throw new Error("signed angle needs a normal vector (use 'up'-vector of THREE.Object3D for example)");

  let n = normalVector.clone().normalize();
  v1.dot(v2);

  let dot = v1.dot(v2);// x1*x2 + y1*y2      # dot product
  let det = n.dot(v1.cross(v2)); // det(v1,v2,n)=n⋅(v1×v2)  //3d case
  let angle = Math.atan2(det, dot); //  # atan2(y, x) or atan2(sin, cos)
  return angle;
}
