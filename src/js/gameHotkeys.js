
import "@nk/core-components"

import {Hotkeys, showHotkeyList} from './Interactions';

import CarCameraControls from './a-car/car/CarCameraControls';
import OptionsDialog from './dialogs/options/OptionDialog';

import $ from 'jquery';

Hotkeys('show help', 'h', function () {
  showHotkeyList();
});

var optionsDialog;
Hotkeys('show help', 'o', function () {
  if (!optionsDialog) {
    optionsDialog = new OptionsDialog();
  } else optionsDialog.$.toggle();
});

// ---------------------------------------------------
Hotkeys('accelerate  car forward', 'i', () => {
  window.car._car.controls().moveForward = true;
}, () => {
  window.car._car.controls().moveForward = false;
});

Hotkeys('accelerate  car backward', 'k', () => {
  window.car._car.controls().moveBackward = true;
}, () => {
  window.car._car.controls().moveBackward = false;
});

Hotkeys('steer car left', 'j', () => {
  window.car._car.controls().moveLeft = true;
}, () => {
  window.car._car.controls().moveLeft = false;
});

Hotkeys('steer car right', 'l', () => {
  window.car._car.controls().moveRight = true;
}, () => {
  window.car._car.controls().moveRight = false;
});

// ---------------------------------------------------

Hotkeys('toggle follow car with camera', '+', function () {
  // TODO use tquery cameracontrols'

  // $('.player').get(0).object3D.position.copy($('a-simple-car').get(0).body.position);
  var camera = $('.player').get(0).object3D.children[0];
  var car = $('a-simple-car').get(0).components['simple-car'];
  var carCamera = new CarCameraControls({camera: camera, car: car});

  function step (timestamp) {
    carCamera.update();
    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);

  // prevent physics between player and car while "driving"
  $('.player').get(0).removeAttribute('static-body');
});

Hotkeys('toggle overlay editor', '#', function () {
  $('.overlay-editor').toggle();
});

Hotkeys('kick ball', 'space', function () {
  var player = $('.player').get(0);
  var ball = $('.ball').get(0);

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
});
