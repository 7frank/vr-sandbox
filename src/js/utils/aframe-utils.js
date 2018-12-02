import $ from 'jquery';
import {setLayersForObject} from '../types/Layers';
import * as _ from 'lodash';
import {getPlayer} from '../game-utils';
import {appendImageToDOM} from '../sketchfab/sketchfab-render';
import {UndoMgr} from './undo-utils';
import {streamIn} from './stream-utils';
import {createHTML} from './dom-utils';
import {createNamespace, namespaceExists} from './namespace';
import {Box3Ext} from '../three/Box3Ext';

/**
 * @deprecated this won't work with elements from different regions TODO getWorldPosition should be used in some way
 * FIXME body position is currently always absolute
 * @param el
 * @returns {*}
 */
export function getPosition (el) {
  if (el.body != null && el.body.position != null) {
    return new THREE.Vector3().copy(el.body.position);
  } else {
    return new THREE.Vector3().copy(el.getAttribute('position'));
  }
}

/**
 * @deprecated this won't work with elements from different regions TODO getWorldPosition should be used in some way
 * FIXME body position is currently always absolute
 * @param el
 * @returns {*}
 */
export function setPosition (el, v) {
  var arr, v2;

  if (typeof v === 'string') {
    arr = v.split(' ');

    v2 = {x: Number(arr[0]), y: Number(arr[1]), z: Number(arr[2])};
  }
  if (v instanceof THREE.Vector3) {
    v2 = v;
    v = v.x + ' ' + v.y + ' ' + v.z;
  }

  _setPosition(el, v);
}

export function _setPosition (el, v) {
  if (el.body != null && el.body.position != null) {
    teleportPhysicsBody(el.body, v);
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

  console.log('playSound', assetSelector);

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
 * TODO refactor improve performance
 * @param {(selector|HTMLElement[])} targetSelector - A selector to query for elements that might be close.
 * @param (selector|HTMLElement) selector - The element that we want to find other close elements for.
 * @param {number} minDistance - if the distance between selector-Element and targetSelector-Elements is bigger than minDistance the targetSelector-Element gets discarded.
 * @returns {*}
 */
export function findClosestEntity (targetSelector, selector = '#player', minDistance = Infinity) {
  var player = typeof selector === 'string' ? document.querySelector(selector) : selector;
  var targets = typeof targetSelector === 'string' ? document.querySelectorAll(targetSelector) : targetSelector;

  if (!targets.length) throw new Error('probably invalid targetSelector');

  var p = getWorldPosition(player.object3D);// .position;

  function getDir (ball) {
    var b = getWorldPosition(ball.object3D);// .position;
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

export function toast (msg, duration = 2000, action = 'Ok') {
  var el = getPlayer();

  const msgEscaped = escape(msg);

  if (typeof duration !== 'number') throw new Error('type mismatch: must be number');

  function checkToastForDeletion (el) {
    if (_.get(el, 'components.toast.label.object3D.children[0].material.opacity') == 0) {
      el.parentNode.removeChild(el);
    }
  }

  if (el) {
    el.querySelectorAll('a-toast').forEach(el => checkToastForDeletion(el));

    // ---------------------------
    // check if a toast with the same message is already visible in which case do nothing
    // fixme use map of <msg,autoID> using msg as key is to broad and will fail for certain cases
    if (el.querySelector(`a-toast[msgEscaped='${msgEscaped}']`)) return;
  }
  const renderToast = () => {
    var actionParam = '';
    if (action) {
      actionParam = `action="${action}"`;
    }
    var t = `<a-entity class="toast-wrapper" ><a-toast  material="depthTest:false" msgEscaped="${msgEscaped}"  message="${msg}" ${actionParam} duration="${duration}"></a-toast></a-entity>`;
    el.insertAdjacentHTML('beforeend', t);

    var wrappers = [...el.querySelectorAll('.toast-wrapper')];

    var i = -0.6;

    for (let item of wrappers.reverse()) {
      item.setAttribute('position', `0 ${i} 1`);
      i += 0.15;
    }
  };

  if (el) {
    renderToast();
  } else {
    setTimeout(() => toast(msg, duration, action), 500);
  }
}

/**
 * ... TODO check why the create method does not work but jquery does
 * @param txt
 * @param layer
 */
export function debugText (txt, layer) {
  var el = createHTML(`<a-text look-at="src:[camera]" color="#ccc" width=50 align="center" position="0 3 0" value="'${txt}'"></a-text>`);
  setTimeout(function loop () {
    var t;
    if (el.getObject3D && (t = el.getObject3D('text'))) {
      setLayersForObject(t, layer);
    } else {
      setTimeout(loop, 100);
    }
  }, 100);

  return el;
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
  v.subVectors(getWorldPosition(me), getWorldPosition(target)).add(getWorldPosition(me));
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

/**
 *
 * @param {HTMLElement} el
 * @param {number} size - The target size  of the axis.
 * @param {string} [name] - The name of the mesh we are waiting to complete loading.
 * @param {string} [axis] - The axis to compare to can be x,y,z for only one axis like y for target-height == 'size' or 'xyz' for the maximum radius to account for.
 * @param {boolean} fixYPosition - If true will calculate the offset to set the object y axis as if it stood on a ground.
 */

export function scaleEntity (el, size, name = 'mesh', axis = 'y', fixYPosition = true, centerEntity = true) {
  // console.log('scaleEntity', arguments);
  var mesh = el.getObject3D(name);

  if (mesh) onMeshLoaded();
  else el.addEventListener('model-loaded', onMeshLoaded);

  function onMeshLoaded () {
    // Note:Object3D not a mesh
    var mesh = el.getObject3D(name);
    if (!mesh) return;// not the mesh we are waiting for

    var bb = new Box3Ext();
    // TODO check these parameters and why only they are working (excluding invisible meshes will result in math errors)
    // TODO also mesh needs parent  which it shouldn't need?
    // if below then the offset of the globe will be ok but the tire in sample dlg is missing
    // bb.setFromObject(mesh, mesh, false, false);
    bb.setFromObject(mesh, mesh.parent, false, false);

    var sphere = bb.getBoundingSphere();

    mesh.boundingBox = bb;
    mesh.boundingSphere = sphere;

    var newScale;

    if (axis == 'xyz') {
      newScale = _.round(size / sphere.radius * 2, 2);
    } else {
      let distance = bb.max[axis[0]] - bb.min[axis[0]];

      newScale = _.round(size / distance, 2);
    }

    el.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);

    // center the entity also
    // TODO this and the yFix could be a separate function depending on one bbox generated only
    if (centerEntity) {
      let center = bb.getCenter();
      mesh.position.x -= center.x;
      mesh.position.y -= center.y;
      mesh.position.z -= center.z;
    }
    //  put on level ground
    if (fixYPosition) {
      mesh.position.y = -bb.min.y;
    }
  }
}

/**
 * Use to render a (object) url with some type info.
 * @param url
 * @param typeInfo
 * @param typeInfo.ext
 * @param typeInfo.mime
 * @returns {HTMLElement}
 */
export function renderURL (url, typeInfo) {
  var category = typeInfo.mime.split('/')[0];

  switch (category) {
    case 'image':
      return renderImage(url);
    case 'text':
      return renderAsTextarea(url);// TODO render in text editor
    case 'video':
      return renderVideo(url);
    default:
      return renderText(url);
  }
}

/**
 *  Creates a text area and adds it to the scene.
 *
 * @param url
 * @returns {HTMLElement}
 */
export function renderAsTextarea (url) {
  var el = createHTML(`<a-entity textarea></a-entity>`);
  setTimeout(() => el.components.textarea.background.setAttribute('material', 'shader', 'flat'), 1000);

  // http://localhost:9000/socket.io/socket.io.js

  function setText (txt) {
    // el.setAttribute('textarea', 'text', txt)
    el.components.textarea.textarea.value = txt;
  }

  streamIn(url)
    .then(res => res.text())
    .then(txt => setText(txt))
    .catch(e => setText(e.message));

  renderAtPlayer(el);

  return el;
}

/**
 *  Creates an image plane and adds it to the scene.
 *
 * FIXME by using domparser and createHTML the entity wont be rendered/initialized
 * TODO refactor package
 * @param url
 * @returns {HTMLElement}
 */
export function renderImage (url) {
  // var el = createHTML(`<a-entity geometry="primitive: plane" material="src:url(${url})"></a-entity>`);
  var id = appendImageToDOM(url).id;
  var el = $(`<a-entity geometry="primitive: plane" material="src:#${id};side:double"></a-entity>`).get(0);

  renderAtPlayer(el);

  return el;
}

export function renderText (txt) {
  var el = $(`<a-text look-at="src:[camera]" color="#ccc" width=20 align="center" position="0 0 0" value="${txt}"></a-text>`).get(0);

  renderAtPlayer(el);

  return el;
}

export function renderVideo (url) {
  // var el = createHTML(`<a-entity geometry="primitive: plane" material="src:url(${url})"></a-entity>`);
  var id = appendImageToDOM(url).od;
  var el = $(`<a-entity position="0 0 -10"  simple-video-player="src:${url}" ></a-entity>`).get(0);

  renderAtPlayer(el);

  return el;
}

/**
 * TODO render imported elements within editable-region not scene
 *
 * @deprecated
 *
 *
 * @param el
 */

export function renderAtPlayer (el, target = document.querySelector('a-scene')) {
  var playerPos = getWorldPosition(getPlayer().object3D);
  var playerDir = getWorldDirection(getPlayer().object3D).normalize().multiplyScalar(3);

  el.setAttribute('position', AFRAME.utils.coordinates.stringify(playerPos.sub(playerDir)));

  // target.appendChild(el);
  UndoMgr.addHTMLElementToTarget(el, target);

  scaleEntity(el, 1);
}

/**
 * returns vector relative to player
 * @param theEl
 */
export function getVectorRelativeToPlayer (theEl) {
  var a = getWorldPosition(theEl.object3D);

  var b = getWorldPosition(theEl.sceneEl.camera.el.object3D);

  return b.sub(a);
}

/**
 * Original Object3D.getWorldPosition updates matrix too often.
 * TODO evaluate whats going on and why it has to be forced to update
 * This should work as long as the renderer automatically updates
 * this one does not update matrix
 * @param {THREE.Object3D} that
 * @returns {THREE.Vector3}
 * @private
 */
export function getWorldPosition (that, target) {
  if (!target) {
    target = new THREE.Vector3();
  }
  return target.setFromMatrixPosition(that.matrixWorld);
}

/**
 * Original Object3D.getWorldPosition updates matrix too often.
 * TODO evaluate whats going on and why it has to be forced to update
 * This should work as long as the renderer automatically updates
 * this one does not update matrix
 * @param {THREE.Object3D} that
 * @returns {THREE.Vector3}
 * @private
 */
export function getWorldQuaternion (that, quaternion) {
  var position = new THREE.Vector3();
  var scale = new THREE.Vector3();
  if (!quaternion) {
    quaternion = new THREE.Quaternion();
  }
  that.matrixWorld.decompose(position, quaternion, scale);

  return quaternion;
}

/**
 * Original Object3D.getWorldPosition updates matrix too often.
 * TODO evaluate whats going on and why it has to be forced to update
 * This should work as long as the renderer automatically updates
 * this one does not update matrix
 * @param {THREE.Object3D} that
 * @returns {THREE.Vector3}
 * @private
 */
export function getWorldScale (that, scale) {
  var position = new THREE.Vector3();
  if (!scale) {
    scale = new THREE.Vector3();
  }
  var quaternion = new THREE.Quaternion();

  that.matrixWorld.decompose(position, quaternion, scale);

  return quaternion;
}

/**
 * Original Object3D.getWorldPosition updates matrix too often.
 * TODO evaluate whats going on and why it has to be forced to update
 * This should work as long as the renderer automatically updates
 * this one does not update matrix
 * @param {THREE.Object3D} that
 * @returns {THREE.Vector3}
 * @private
 */
export function getWorldDirection (that, target) {
  var quaternion = new THREE.Quaternion();

  getWorldQuaternion(that, quaternion);
  if (!target) {
    target = new THREE.Vector3();
  }
  return target.set(0, 0, 1).applyQuaternion(quaternion);
}

export function getWorldDistance (that, target) {
  return getWorldPosition(target).sub(getWorldPosition(that)).length();
}

/**
 * Determines if the mesh faces in the direction of the camera or away from it.
 *
 * @param planeMesh - the mesh
 * @param cameraObject - A threejs object that is the parent for the THREE.Camera
 * @returns {string}
 */
export function checkSide (planeMesh, cameraObject) {
  let A = planeMesh;
  let B = cameraObject;

  let distance = new THREE.Plane((new THREE.Vector3(0, 0, 1)).applyQuaternion(A.quaternion)).distanceToPoint(getWorldPosition(B).sub(getWorldPosition(A)));

  return distance >= 0 ? 'front' : 'back';
}

/**
 * sorts an array of entity based on their distance from closest to farthest
 *
 *
 * @param entityArray
 */
export function sortEntitiesByDistance (entityArray) {
  var nodes = document.querySelectorAll('[editable-region]').toArray();
  var distances = nodes.map((el, id) => ({
    id,
    el,
    distance: el.object3D.position.clone().sub(el.sceneEl.camera.el.object3D.position).length()
  }));
  return _.sortBy(distances, item => item.distance)
    .map(item => item.el);
}

/**
 * returns the closest editable region within the sceneEl
 *
 */
export function getClosestEditableRegion (sceneEl) {
  var nodes = sceneEl.querySelectorAll('[editable-region]').toArray();
  return sortEntitiesByDistance()[0];
}

/**
 * have a isVisible helper function that checks for object.visible material.visible and layers visible
 */
export const isVisibleTo = (obj3d, obj2) => {
  return obj3d.visible && (obj3d.material ? obj3d.material.visible : true) && obj3d.layers.test(obj2.layers);
};

/**
 * Counts the depth of a THREE.Object3D within a tree structure.
 * @param {THREE.Object3D} obj
 * @param parentKey - A key within the obj - obj[key] - that links to the parent object.
 * @returns {number}
 */
export function countDepth (obj, parentKey) {
  var count = 0;
    while (obj = _.get(obj, parentKey)/* eslint-disable-line */) {
    count++;
  }

  return count;
}

export function getCompoundBoundingBox (object3D) {
  var box = new THREE.Box3();
  box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));

  object3D.traverse(function (obj3D) {
    var geometry = obj3D.geometry;
    if (geometry === undefined) return;
    geometry.computeBoundingBox();
    if (box === null) {
      box = geometry.boundingBox;
    } else {
      box.union(geometry.boundingBox);
    }
  });
  return box;
}

/**
 * restarts physics for an entity
 * example: restartPhysics($("a-simple-car"), "dynamic-body", "shape: box; mass: 2")
 * TODO enter/leave vehicle functions also stop car controls on exit vehicle
 *
 * @param el
 * @param bodyType
 * @param defaultVal
 * @param overrideVal
 */
export function restartPhysics (el, bodyType = 'dynamic-body', defaultVal = '', overrideVal = false) {
  var val;
  if (!overrideVal) val = el.getAttribute(bodyType);
  if (val == null) val = defaultVal;
  el.removeAttribute(bodyType);
  el.setAttribute(bodyType, val);
}

/**
 * promise texture
 */

export
async function loadTexture (url) {
  return new Promise(function (resolve, reject) {
    var loader = new THREE.TextureLoader();
    loader.load(
      // resource URL
      url,
      // onLoad callback
      resolve,
      // onProgress callback currently not supported
      undefined,
      reject
    );
  });
}

/**
 * clones array or single material of mesh AND removes clipping planes
 * @param mesh
 * @param recursive - TODO
 * @returns {null}
 */

export function cloneMeshMaterial (mesh, recursive = true, removeClippingPlanes = true) {
  if (!mesh.material) return null;

  const doClone = (material) => {
    let cloned = material.clone();
    cloned.needsUpdate = true;
    cloned.clippingPlanes = removeClippingPlanes ? null : cloned.clippingPlanes;
    return cloned;
  };

  if (_.isArray(mesh.material)) {
    return mesh.material.map(doClone);
  }

  return doClone(mesh.material);
}
