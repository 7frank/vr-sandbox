import CarCameraControls from './a-car/car/CarCameraControls';
import {findClosestEntity, getPosition, getWorldPosition, playSound, setPosition, toast} from './utils/aframe-utils';
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

var drivingVehicle = false;
var whichVehicle = null;

export function enterOrExitVehicle (event) {
  event.stopPropagation();

  var player = getPlayer();
  if (!drivingVehicle) {
    var target = findClosestEntity('a-simple-car', getPlayer(), 5);

    if (!target) {
      toast('Get closer to a vehicle to enter it.', 'Got it.');
      playSound('.command-error');

      return;
    }

    whichVehicle = target;
    enterVehicle(player, target);
    drivingVehicle = !drivingVehicle;
  } else {
    exitVehicle(player, whichVehicle);
    drivingVehicle = !drivingVehicle;
  }
}

var carCamControls;

function exitVehicle (player, vehicle) {
  vehicle.removeAttribute('customizable-wasd-car-controls');
  player.setAttribute('customizable-wasd-controls', true);
  player.setAttribute('look-controls', true);

  if (carCamControls) {
    carCamControls.stop();
  }

  var exitPos = getWorldPosition(vehicle.object3D);
  exitPos.y += 1;
  setPosition(player, exitPos);
}

function enterVehicle (player, vehicle) {
  vehicle.setAttribute('customizable-wasd-car-controls', true);
  player.removeAttribute('customizable-wasd-controls');
  player.removeAttribute('look-controls');
  if (!carCamControls) { carCamControls = createAndAttachCarCameraControls(player, vehicle); } else carCamControls.start();
}
