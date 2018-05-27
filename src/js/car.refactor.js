import CarCameraControls from './a-car/car/CarCameraControls';
import {
  findClosestEntity, getPosition, getWorldDirection, getWorldPosition, lookAtAndOrient, playSound, setPosition,
  toast
} from './utils/aframe-utils';
import {getPlayer} from './game-utils';
import {FPSCtrl} from './utils/fps-utils';
export function createAndAttachCarCameraControls (player, vehicle) {
  // TODO check how tquery camera controls better would work with other aframe controls

  var camera = player.object3D.children[0];
  var car = vehicle.components['simple-car'];
  var carCamera = new CarCameraControls({camera: camera, car: car});

  var carUpdateScript = new FPSCtrl(60, () => carCamera.update()).start();

  // prevent physics between player and car while "driving"
  var staticBody = player.getAttribute('static-body');
  return {
    start: function () {
      player.removeAttribute('static-body');
      carUpdateScript.start();
    },
    stop: function () {
      carUpdateScript.stop();
      // will freeze if no timeout is set
      setTimeout(() => player.setAttribute('static-body', staticBody), 200);
    }
  };
}

var carCamControls;

export
function exitVehicle (player, vehicle) {
  // vehicle.removeAttribute('customizable-wasd-car-controls');
  player.setAttribute('customizable-wasd-controls', 'enabled', true);
  player.setAttribute('look-controls', true);

  if (carCamControls) {
    carCamControls.stop();
  }

  // FIXME the rotation is currently applied to the car model not to the container
  let car = vehicle.components['simple-car'].getCarInstance();
  let carModel = car.model();

  // TODO exit on the left side of the car facing in the driving direction
  // TODO use animation :>
  // var pos = getWorldPosition(vehicle.object3D);
  var pos = getWorldPosition(carModel);
  // var dir = getWorldDirection(vehicle.object3D);// .multiplyScalar(-1);
  var dir = getWorldDirection(carModel).normalize();

  var exitPos = pos.clone();

  // --------------
  var vector = dir.clone();

  var axis = new THREE.Vector3(0, 1, 0);
  var angle = Math.PI / 2;

  vector.applyAxisAngle(axis, angle).multiplyScalar(2);
  // ---------------

  exitPos.add(vector);

  // exitPos.add(dir);
  // exitPos.y = 1;

  var lookPos = exitPos.clone().add(dir);

  exitPos.y = 1.8;
  setPosition(player, exitPos);

  // player.object3D.lookAt(lookPos);
  // player.sceneEl.camera.lookAt(lookPos);
  // player.sceneEl.camera.lookAt(pos);

  // lookAtAndOrient(player.object3D, lookPos, vehicle.object3D);

/*
  console.log('pos', pos);
  console.log('dir', dir);
  console.log('dir rotated', vector);
  console.log('exitPos', exitPos);
  console.log('lookPos', lookPos);

  */
}
export
function enterVehicle (player, vehicle) {
  // vehicle.setAttribute('customizable-wasd-car-controls', true);
  player.setAttribute('customizable-wasd-controls', 'enabled', false);
  player.removeAttribute('look-controls');
  if (!carCamControls) { carCamControls = createAndAttachCarCameraControls(player, vehicle); } else carCamControls.start();
}
