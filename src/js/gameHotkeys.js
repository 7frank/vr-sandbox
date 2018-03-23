// FIXME inlcuding this will break 3d in the current version
// TODO we need a proper entry point!
// import * as hk from '@nk/core-components/dist/bundle';
// import * as hk from '@nk/core-components';
// import * as hk from '@nk/core-components/dist/bundle';
// import '@nk/core-components/dist/bundle';

import CarCameraControls from './a-car/car/CarCameraControls';
import {createGeneralOptionsDialog} from './gui/dialogs/options/OptionDialog';

import $ from 'jquery';
import * as CANNON from 'cannon';
import {
  findClosestEntity,
  getDirectionForEntity,
  getPosition,
  playSound, scaleEntity,
  setPosition,
  toast
} from './utils/aframe-utils';
import {getTextEditorInstance} from './a-editable/utils';
import {startEditingTextarea} from './a-editable/editable-actor';
import {ImpactGUI} from './utils/performance-utils';

import {create, setCenter} from './utils/dom-utils';
import {addScript} from './utils/misc-utils';
import {
  convertEntriesPromise, downloadZip, importResult, loadBrowser,
  rewritePathsOfSceneGLTF
} from './sketchfab/sketchfab-browser';

function handlerwrapper () {
  console.log('codeeditor', window.THREE);

  addScript('http://localhost:9000/api/node_modules/three-codeeditor/codeeditor3d.dev.js', function () {
    console.log('codeeditor', window.THREE.CodeEditor);
  });

  setTimeout(function handler (event) {
    // <!-- FIXME remove in production use CopyWebpackPlugin instead  -->
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
  var dlg;

  function createOD () {
    if (!optionsDialog) {
      optionsDialog = createGeneralOptionsDialog();

      // dialog -------------------------------------

      dlg = create("<nk-window title='Options Dialog' class='card card-1'>");
      dlg.appendChild(optionsDialog.$el);
      dlg.closingAction = 1; // hide on close //FIXME

      document.body.appendChild(dlg);
      // TODO implementation: setCenter on appendCallback via "center" attribute in nk-window
      setCenter(dlg);
    } else $(dlg).toggle();
  }

  function selectOD (id) {
    if (!optionsDialog) {
      createOD();
      var tab = optionsDialog.$children[0];
      setTimeout(() => tab.setActiveTab(id), 1);
    } else {
      var tab = optionsDialog.$children[0];
      if (tab.activeTabId == id) {
        $(dlg).toggle();
      } else {
        setTimeout(() => tab.setActiveTab(id), 1);
        $(dlg).show();
      }
    }
  }

  Hotkeys('show help', 'o', function () {
    selectOD('general');
  });

  // ----------------------------------------------
  Hotkeys('player-move-forward', ['w', 'touch'], () => {
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

  function enterOrExitVehicle () {
    var player = $('.player').get(0);
    if (!drivingVehicle) {
      var target = findClosestEntity('a-simple-car', '.player', 5);

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

  // TODO this should be more like a "interact with object" button
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
  // FIXME not working ..
  Hotkeys('teleport to next region', 'shift+t', function () {
    var el = $('[editable-region]')[2];
    var targetLocation = el.object3D.position;
    targetLocation.y += 20;
    setPosition($('.player').get(0), targetLocation.x + ' ' + targetLocation.y + ' ' + targetLocation.z);
  }, {
    category: 'editing'
  });

  Hotkeys('load sketchfab browser', 'shift+l', function () {
    function renderBufferedGLTFContent (rewrittenLinksURL) {
      var tpl = `<a-entity class="imported-model"
        scale="1 1 1"
        animation-mixer="clip: *;"
        gltf-model="src: url(${rewrittenLinksURL});">
        </a-entity>`;

      var el = $(tpl);

      var playerPos = document.querySelector('.player').object3D.getWorldPosition();
      el.get(0).object3D.position.copy(playerPos);

      $('a-scene').append(el);

      scaleEntity(el.get(0), 10);

      window.mLoadingbar.hide();
    }

    // -----------------------------
    // FIXME CORS when running locally  ....
    var dlg = create("<nk-window title='Sketchfab Browser - Import' class='card card-1' style='height:400px;width: 800px;' >");
    var sf = loadBrowser(function onFileImportStart (result) {
      importResult(result, function (rewrittenLinksURL) {
        renderBufferedGLTFContent(rewrittenLinksURL);
      }, function onProgress (info) {
        window.mLoadingbar.show();
        window.mLoadingbar.set('importing:' + result.model.name, info.current, info.size);
      });
    });
    $(dlg).focus();

    // TODO promisify functions
    /* downloadZip()
              .then(convertEntriesPromise)
              .then(fetchScene)
              .then(rewritePathsOfSceneGLTF)
              .then(renderBufferedGLTFContent)
        */

    function getJSON (url) {
      return fetch(url)
        .then(function (response) {
          return response.json();
        });
    }

    $(sf).css('height', '100%');

    dlg.appendChild(sf);
    document.body.appendChild(dlg); // TODO have show method that if no parent is set sets to d.body

    setCenter(dlg);
  }, {
    category: 'editing'
  });

  Hotkeys('toggle world map', 'Tab', function () {
    var worldMap = $('.the-world-map:first').get(0);
    if (worldMap.hasAttribute('world-map')) {
      worldMap.removeAttribute('world-map');
    } else worldMap.setAttribute('world-map', true);
  }, {
    category: 'HUD'
  });

  Hotkeys('show region performance', 'i', function () {
    document.querySelectorAll('[editable-region]').forEach(r => console.log(r.showPerfInfo()));
  }, {
    category: 'debug'
  });
  Hotkeys('show scripts performance', 'p', function () {
    selectOD('performance');
  }, {
    category: 'debug'
  });
  Hotkeys('show layers dialog', 'l', function () {
    selectOD('layers');
  }, {
    category: 'debug'
  });

  // ------------------------------------
}
