// ---------------------------------------------------
import CarCameraControls from './a-car/car/CarCameraControls';
import {findClosestEntity, getPosition, playSound, setPosition, toast} from './utils/aframe-utils';
import {getPlayer} from './game-utils';

export
function createAndAttachCarCameraControls (player, vehicle) {
  // TODO check how tquery camera controls better would work with other aframe controls

  var camera = player.object3D.children[0];
  var car = vehicle.components['simple-car'];
  var carCamera = new CarCameraControls({camera: camera, car: car});

  var cancel = false;

  function step (timestamp) {
    if (cancel) return;
    carCamera.update();
    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);

  // prevent physics between player and car while "driving"
  player.removeAttribute('static-body');

  return {
    undo: function () {
      cancel = true;
      player.setAttribute('static-body', true);
    }
  };
}

var drivingVehicle = false;
var whichVehicle = null;

export
function enterOrExitVehicle () {
  var player = getPlayer();
  if (!drivingVehicle) {
    var target = findClosestEntity('a-simple-car', getPlayer(), 5);

    if (!target) {
      toast('Get closer to a vehicle to enter it.', 'Got it.');
      // console.warn('no vehicle close enough ', 'a-simple-car');
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
  toast('leaving vehicle');
  vehicle.removeAttribute('customizable-wasd-car-controls');
  player.setAttribute('customizable-wasd-controls', true);
  player.setAttribute('look-controls', true);

  if (carCamControls) {
    carCamControls.undo();
  }
  // FIXME exiting vehicle doesn't position player at correct place
  var exitPos = getPosition(vehicle);
  setPosition(player, exitPos);
}

function enterVehicle (player, vehicle) {
  vehicle.setAttribute('customizable-wasd-car-controls', true);
  player.removeAttribute('customizable-wasd-controls');
  player.removeAttribute('look-controls');
  carCamControls = createAndAttachCarCameraControls(player, vehicle);
}
