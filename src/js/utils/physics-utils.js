import * as CANNON from 'cannon';
import * as _ from 'lodash';
import {querySelectorAll} from './selector-utils';
import {BoxHelperExt} from '../three/BoxHelperExt';
import {FPSCtrl} from './fps-utils';

export function addBoundingBox (obj) {
  var helper = new BoxHelperExt(obj);

  obj.parent.add(helper);

  var fc = new FPSCtrl(0.5, function (e) {
    // render each frame here
    helper.update(undefined, obj.parent, true, false);
  });
  fc.start();
  return helper;
}

/**
 * goal find children of model and for example attach bounding boxes for physics
 *
 *
 * @param selector
 * @returns {*|jQuery|HTMLElement}
 */

export function testCompoundGLTF (modelEl, debug = false) {
  var items = querySelectorAll(modelEl.object3D, '.Mesh');
  items.shift();
  if (debug) {
    console.group('cannon-compound:testCompoundGLTF');
  }

  function localToObject (vector, object3D) {
    return vector.applyMatrix4(object3D.matrix);
  }

  var i = 0;
  items.forEach(el => {
    if (el.geometry) el.geometry.computeBoundingBox();

    var bb = el.geometry.boundingBox;
    var vCenter = bb.getCenter();
    var size = bb.getSize();

    console.log(el.name, 'size', size.length());
    // TODO don't ignore big stuff anymore
    if (size.length() >= 20) {
      // if (i++ >= 20) {
      el.visible = false;

      return;
    } // TODO only use first few elements for testing

    // FIXME the physics are one global system so we need our bodys to be relative to the world for now
    // but later on we probably will need different independent worlds
    var region = modelEl.parentEl;
    //  var regionPosition = modelEl.object3D.position.clone().applyMatrix4(region.object3D.matrix);

    // var vPosition = regionPosition.add(vCenter);
    //  console.log(el.matrixWorld);
    // var vPosition = el.localToWorld(el.position.clone());
    // var vPosition = el.position.clone().applyMatrix4(region.object3D.matrix).add(vCenter);

    // TODO shouldn't the center be applied Oo?
    var vPosition = el.getWorldPosition();// .applyMatrix4(region.object3D.matrix)
    // .add(vCenter);

    var vScale = el.getWorldScale();
    var vQuaternion = el.getWorldQuaternion();

    var testMult = 1;
    size.x *= vScale.x * testMult;
    size.y *= vScale.y * testMult;
    size.z *= vScale.z * testMult;

    //    var vPosition = el.position.clone().add(vCenter);
    // var vPosition = el.position.clone().add(vCenter);

    // FIXME position is not correct
    //    vPosition = localToObject(vPosition, modelEl.object3D);
    // vPosition = localToObject(vCenter, modelEl.object3D);

    /* // ---------------------------------------

                                var shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));

                                var cannonPos = new CANNON.Vec3(vPosition.x, vPosition.y, vPosition.z);

                                modelEl.body.addShape(shape, cannonPos);
                            */
    // ---------------------------------------
    /*
                                 var boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
                                var boxBody = new CANNON.Body({ mass: 000 });
                                boxBody.addShape(boxShape);
                                boxBody.position.set(vPosition.x, vPosition.y, vPosition.z);
                                modelEl.body.world.addBody(boxBody);
                            */
    // ---------------------------------------
    /* var geometry = new THREE.BoxGeometry(size.x / 2, size.y / 2, size.z / 2);
                                var material = new THREE.MeshBasicMaterial({color: 0x0000ff});
                                var cube = new THREE.Mesh(geometry, material);
                                cube.position.copy(vPosition);
                                modelEl.sceneEl.object3D.add(cube);
                            */
    // ---------------------------------------

    // ok so far the closest to something working ...
    // el=jQuery("#physicsTestRegion").find("[gltf-model]")[0]
    var boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    var boxBody = new CANNON.Body({mass: 0});
    boxBody.addShape(boxShape);
    boxBody.position.set(vPosition.x, vPosition.y, vPosition.z);
    boxBody.quaternion.set(vQuaternion.x, vQuaternion.y, vQuaternion.z, vQuaternion.w);

    modelEl.body.world.addBody(boxBody);
    var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    var material = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true});
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(vPosition.x, vPosition.y, vPosition.z);

    cube.quaternion.set(vQuaternion.x, vQuaternion.y, vQuaternion.z, vQuaternion.w);

    modelEl.sceneEl.object3D.add(cube);

    // TODO the rotatiom is wrong
    // el=jQuery("#physicsTestRegion").find("[gltf-model]")[0];el.object3D.quaternion.x=0.7;

    // -------------------------------------------------
    if (debug) {
      // console.log(el);
      // console.log('position', stringifyWithPrecision(vPosition), 'size', stringifyWithPrecision(size));

      var helper = addBoundingBox(el);

      // TODO collision per sub-element not working
      boxBody.addEventListener('collide', _.debounce(function (e) {
        // console.log(modelEl, 'has collided with body ', e.detail.body);
        console.log('collision', e);
        e.body.el.setAttribute('color', _.sample('red', 'yellow', 'blue'));
        // console.log('collision', e);
        /*   e.detail.target.el;  // Original entity (playerEl).
                                                                    e.detail.body.el;    // Other entity, which playerEl touched.
                                                                    e.detail.contact;    // Stats about the collision (CANNON.ContactEquation).
                                                                    e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
                                                               */
      }, 50));
    }
  });

  if (debug) {
    console.groupEnd();
  }
}
