// FIXME inlcuding this will break 3d in the current version
// TODO we need a proper entry point!
// import * as hk from '@nk/core-components/dist/bundle';
// import * as hk from '@nk/core-components';
// import * as hk from '@nk/core-components/dist/bundle';
// import '@nk/core-components/dist/bundle';

import CarCameraControls from './a-car/car/CarCameraControls';
import OptionsDialog from './dialogs/options/OptionDialog';

import $ from 'jquery';
import * as CANNON from 'cannon';
import {addScript, findClosestEntity, getDirectionForEntity, playSound, toast} from './util';
import {getTextEditorInstance} from './a-editable/utils';
import {startEditingTextarea} from './a-editable/editable-actor';

const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

function handlerwrapper () {
  console.log('codeeditor', window.THREE);

  addScript('http://localhost:9000/api/node_modules/three-codeeditor/codeeditor3d.dev.js', function () {
    console.log('codeeditor', window.THREE.CodeEditor);
  });

  setTimeout(function handler (event) {
    // <!-- FIXME remove in production  -->
    addScript('http://localhost:9000/api/node_modules/@nk/core-components/dist/bundle.js', function () {
      addHotkeys();
    });

    var s2 = document.createElement('nk-hotkey-dialog');
    s2.id = 'dialog1';
    s2.title = 'Input Configuration';
    s2.className = 'card card-1'; // add some material design
    s2.setAttribute('style', 'top:50px;left:50%;position:absolute;width:600px;height:300px');
    s2.style.display = 'none';
    document.body.appendChild(s2);
  }, 1000);
}

document.addEventListener('DOMContentLoaded', handlerwrapper);

/**
 * the hotkeys might need some option (or additional flag handler) for 3d mode
 *  onKeyComboTriggered() => distance(camera,menu3d|selector)<value => useKeyCombo()
 * TODO normally an event would be bound to the selector directly which would not be the case in 3d (or would it?)
 *
 */
function addHotkeys () {
  // var Hotkeys = window.NKCore.addHotkeys;
  var hotkeyDialog = document.querySelector('nk-hotkey-dialog');

  // TODO disable hotkeys when textarea is focused

  var Hotkeys = hotkeyDialog.addHotkeys.bind(hotkeyDialog);

  var optionsDialog;
  Hotkeys('show help', 'o', function () {
    if (!optionsDialog) {
      optionsDialog = new OptionsDialog();
    } else optionsDialog.$.toggle();
  });

  // ----------------------------------------------
  Hotkeys('player-move-forward', 'w', () => {
  }, () => {
  }, {category: 'player', description: 'Moves the player in the forward direction.'});
  Hotkeys('player-move-backward', 's', () => {
  }, () => {
  }, {category: 'player', description: 'Moves the player in the backward direction.'});
  Hotkeys('player-strafe-left', 'a', () => {
  }, () => {
  }, {category: 'player', description: 'Moves the player  sideways.'});
  Hotkeys('player-strafe-right', 'd', () => {
  }, () => {
  }, {category: 'player', description: 'Moves the player  sideways.'});
  Hotkeys('player-rotate-left', 'q', () => {
  }, () => {
  }, {category: 'player', description: 'Rotates the player.'});
  Hotkeys('player-rotate-right', 'e', () => {
  }, () => {
  }, {category: 'player', description: 'Rotates the player.'});

  // ---------------------------------------------------
  // todo the keys for car would be the same wasd but only if player controler is set to car entity
  // TODO how does this interfere with car contols existing and actions and customization
  /* Hotkeys('move forward', 'i', () => {
      window.car._car.controls().moveForward = true;
    }, () => {
      window.car._car.controls().moveForward = false;
    }, {category: 'car', description: 'Accelerates the car in the forward direction.'});

    Hotkeys('move backward', 'k', () => {
      window.car._car.controls().moveBackward = true;
    }, () => {
      window.car._car.controls().moveBackward = false;
    }, {category: 'car', description: 'Accelerates the car in the backward direction.'});

    Hotkeys('steer left', 'j', () => {
      window.car._car.controls().moveLeft = true;
    }, () => {
      window.car._car.controls().moveLeft = false;
    }, {category: 'car'});

    Hotkeys('steer right', 'l', () => {
      window.car._car.controls().moveRight = true;
    }, () => {
      window.car._car.controls().moveRight = false;
    }, {category: 'car'});

  */

  // ---------------------------------------------------

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

  function enterOrExitVehicle () {
    var target = findClosestEntity('a-simple-car', '.player', 5);

    if (!target) {
      toast('Get closer to a vehicle to enter it.', 'Got it.');
      console.warn('no vehicle close enough ', 'a-simple-car');
      playSound('.command-error');
      return;
    }

    var player = $('.player').get(0);
    if (player.hasAttribute('customizable-wasd-controls')) {
      enterVehicle(player, target);
    } else {
      exitVehicle(player, target);
    }
  }

  var carCamControls;
  function exitVehicle (player, vehicle) {
    toast('leaving vehicle');
    vehicle.removeAttribute('customizable-wasd-car-controls');
    player.setAttribute('customizable-wasd-controls', true);
    if (carCamControls) {
      carCamControls.undo();
    }
  }

  function enterVehicle (player, vehicle) {
    vehicle.setAttribute('customizable-wasd-car-controls', true);
    player.removeAttribute('customizable-wasd-controls');
    carCamControls = createAndAttachCarCameraControls(player, vehicle);
  }

  Hotkeys('enter-vehicle', 'r', enterOrExitVehicle, {
    category: 'car',
    description: 'Lets player enter the vehicle and switches from player camera to car camera.'
  });

  /**
     * @deprecated not the whole scene schould be edited but only smaller parts of it (actors and regions within the world)
     */
  Hotkeys('toggle overlay editor', '#', function () {
    $('.overlay-editor').toggle();
  }, {description: 'Opens an overlay editor where the current scene can be edited in.'});

  Hotkeys('kick ball', 'c', function () {
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
  }, {category: 'game play', description: 'Will kick the ball a small bit when the player is close enough.'});

  Hotkeys('activate jetpack', 'space', function () {
    var player = $('.player').get(0);
    var ball = $('.ball').get(0);

    /* el.body.applyImpulse(
                                              // impulse  new CANNON.Vec3(0, 1, 0),
                                              // world position  new CANNON.Vec3().copy(el.getComputedAttribute('position'))
                                            );
                                            */
    var el = ball; // partially works with ball but not with player body as it seems
    el.body.applyImpulse(new CANNON.Vec3(0, 1, 0), new CANNON.Vec3(0, -1, 0)); // new CANNON.Vec3().copy(el.getComputedAttribute('position')));
  }, {category: 'game play', description: 'will elevate the player by a small margin'});

  // ------------------------------------
  // scene editing

  function createEditableNode () {
    // raytrace to position
    // create element at
    var player = $('.player').get(0);

    var direction = getDirectionForEntity(player);

    direction.y = 0;
    direction.multiplyScalar(-10);
    var container = $('a-scene');

    var t = direction.add(player.object3D.position);
    var elPos = `${t.x} ${t.y} ${t.z}`;

    // TODO dynamic-body="shape: box;mass:10;"
    var element = $(`<a-entity editable-actor  position="${elPos}" rotation="0 0 0"></a-entity>`);

    container.append(element);
  }

  // TODO refactor
  // FIXME clicking button not working on mobile
  $('#editACEButton').on('click', focusAce);
  $('#editableActorBtn').on('change', createEditableNode);

  function focusAce () {
    console.warn('focus not working in mixed mode FIXME'); // the standalone demo seems to be working

    hotkeyDialog.pause();

    var c = $('[code-editor]').get(0);
    var editor = c.components['code-editor'].editor;
    var aceEditor = editor.aceEditor;
    aceEditor.focus();
    // TODO have a blur handler that checks if ace looses focus
  }

  Hotkeys('create editable node', 'b', createEditableNode, {
    category: 'editing',
    description: 'generates an editable node at player position/target '
  });

  Hotkeys('start editing nearest  node', 'n', startEditingTextarea, {
    category: 'editing',
    description: 'selects an editable node and opens a textarea to edit the content. Leave with the mousecursor to disable the textarea or enter again to resume editing.'
  });

  // TODO "live bind" this via "esc or ctrl+s or similar" to aframe-textarea-component > textarea and disable mouetrap while editing
  // Hotkeys('stop editing ', 'm', stopEditingTextarea, {category: 'editing', description: 're-enables navigation of scene'});

  Hotkeys('increase size of textarea', '+', function () {
    var textarea = getTextEditorInstance().get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 1.2 + ' ' + oldScale.y * 1.2 + ' ' + 1);
  }, {
    category: 'editing'
  });

  Hotkeys('increase size of textarea', '+', function () {
    var textarea = getTextEditorInstance().get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 0.8 + ' ' + oldScale.y * 0.8 + ' ' + 1);
  }, {
    category: 'editing'
  });

  // ------------------------------------
}
