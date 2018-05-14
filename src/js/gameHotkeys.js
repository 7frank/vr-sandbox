import $ from 'jquery';
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

import {createHTML, setCenter} from './utils/dom-utils';
import {openOptionsDialog} from './gameOptionsDialog';
import {activateJetpack, getBall, getPlayer, playerKickBall} from './game-utils';

import {attachCodeEditor} from './reafactor.stuff';
import {enterOrExitVehicle} from './car.refactor';
import {createEditableNode} from './editing-utils';
import {loadSketchfabBrowser, renderGLTFOrGlbURL} from './sketchfab/sketchfab-render';
import {exportElementUnderCursor} from './export/GLTF-exporter-utils';
import {UndoMgr} from './utils/undo-utils';
import {streamIn} from './utils/stream-utils';
import {connectToServer, getSomeSampleData} from './database-utils';

// import {Hotkeys} from '@nk/core-components/dist/bundle';

const {detect} = require('detect-browser');
// const browser = detect();
// if (browser.name == 'firefox')

var hotkeyDialog;
var Hotkeys;

/**
 * this loads the hotkeys module which won't load via import
 * Note: DomContentLoaded event will not work here (will still stay blank)
 */
window.addEventListener('load', function () {
  var CustomComponents = require('@nk11/core-components/dist/bundle');
  Hotkeys = CustomComponents.Hotkeys;

  hotkeyDialog = createHTML("<nk-hotkey-dialog title='Input Configuration' class='card card-1' style='z-index: 1;top:50px;left:50%;position:absolute;width:600px;height:300px;display:none' ></nk-hotkey-dialog>");
  document.body.appendChild(hotkeyDialog);
  addHotkeys();
});

/**
 * TODO the hotkeys might need some option (or additional flag handler) for 3d mode
 * Hotkeys.setState("main-menu")
 * Hotkeys.unsetState("main-menu")
 *
 * Hotkeys.pushState("main-menu")
 * main-menu ... close (default esc) Hotkeys.popState()
 *
 *
 *
 *
 *  onKeyComboTriggered() => distance(camera,menu3d|selector)<value => useKeyCombo()
 * TODO normally an event would be bound to the selector directly which would not be the case in 3d (or would it?)
 * TODO disable hotkeys when textarea is focused
 */
function addHotkeys () {
  var ACTIONS = {
    undo: 'undo',
    redo: 'redo'
  };

  Hotkeys.register('show help', 'o');
  Hotkeys().on('show help', function () {
    openOptionsDialog('general');
  });

  Hotkeys.register('change controls', 'c');
  Hotkeys().on('change controls', function () {
    openOptionsDialog('controls');
  });

  Hotkeys.register('toggle world map', 'Tab', {
    category: 'HUD'
  });

  Hotkeys().on('toggle world map', function () {
    var worldMap = $('.the-world-map:first').get(0);
    if (worldMap.hasAttribute('world-map')) {
      worldMap.removeAttribute('world-map');
    } else worldMap.setAttribute('world-map', true);
  });

  // FIXME menu is working suboptimally
  var mRingMenu = $(`<a-entity ring-menu position="0 0 0"></a-entity>`);

  Hotkeys.register('toggle ring menu', 'shift+3', {
    category: 'HUD'
  });
  Hotkeys().on('toggle ring menu', function (...args) {
    var player = getPlayer();
    $(player).append(mRingMenu);

    $(mRingMenu).toggle();
  }, function () {
    $(mRingMenu).toggle();
  });

  // ----------------------------------------------
  // FIXME controls are overloaded and will work despite these wasd controls below not being active
  Hotkeys.register('player-move-forward', ['w', 'touch'], {
    category: 'player',
    description: 'Moves the player in the forward direction.',
    stopPropagation: false
  });
  Hotkeys.register('player-move-backward', ['s'], {
    category: 'player',
    description: 'Moves the player in the backward direction.',
    stopPropagation: false
  });
  Hotkeys.register('player-strafe-left', ['a'], {
    category: 'player',
    description: 'Moves the player  sideways.',
    stopPropagation: false
  });

  Hotkeys.register('player-strafe-right', ['d'], {
    category: 'player',
    description: 'Moves the player  sideways.',
    stopPropagation: false
  });

  Hotkeys.register('player-rotate-left', ['q'], {
    category: 'player',
    description: 'Rotates the player.',
    stopPropagation: false
  });
  Hotkeys.register('player-rotate-right', ['e'], {
    category: 'player',
    description: 'Rotates the player.',
    stopPropagation: false
  });

  Hotkeys().on('player-move-forward', () => {
  }, () => {
  });
  Hotkeys().on('player-move-backward', () => {
  }, () => {
  });
  Hotkeys().on('player-strafe-left', () => {
  }, () => {
  });
  Hotkeys().on('player-strafe-right', () => {
  }, () => {
  });

  Hotkeys().on('player-rotate-left', () => {
  }, () => {
  });
  Hotkeys().on('player-rotate-right', () => {
  }, () => {
  });

  // TODO this should be more like a "interact with object" button where the object determines what will happen
  // TODO bind this directly to the vehicle and only have one global handler that notifies the user if nothing was selected
  // action name player-interact
  Hotkeys.register('enter-vehicle', 'r', {
    category: 'car',
    description: 'Lets player enter the vehicle and switches from player camera to car camera.'
  });

  Hotkeys().on('enter-vehicle', enterOrExitVehicle);

  /**
     * @deprecated not the whole scene should be edited but only smaller parts of it (actors and regions within the world)
     */
  Hotkeys.register('toggle overlay editor', '#', {description: 'Opens an overlay editor where the current scene can be edited in.'});
  Hotkeys().on('toggle overlay editor', function () {
    $('.overlay-editor').toggle();
  });

  Hotkeys.register('kick ball', 'c', {
    category: 'game play',
    description: 'Will kick the ball a small bit when the player is close enough.'
  });
  Hotkeys().on('kick ball', playerKickBall);

  Hotkeys.register('activate jetpack', 'space', {
    category: 'game play',
    description: 'will elevate the player by a small margin'
  });
  Hotkeys().on('activate jetpack', activateJetpack);

  // scene editing

  Hotkeys.register('create editable node', 'b', {
    category: 'editing',
    description: 'generates an editable node at player position/target '
  });

  Hotkeys().on('create editable node', () => createEditableNode(hotkeyDialog));

  Hotkeys.register('start editing nearest  node', 'n', {
    category: 'editing',
    description: 'selects an editable node and opens a textarea to edit the content. Leave with the mousecursor to disable the textarea or enter again to resume editing.'
  });

  Hotkeys().on('start editing nearest  node', startEditingTextarea);

  // TODO "live bind" this via "esc or ctrl+s or similar" to aframe-textarea-component > textarea and disable mouetrap while editing
  // Hotkeys('stop editing ', 'm', stopEditingTextarea, {category: 'editing', description: 're-enables navigation of scene'});

  Hotkeys.register('increase size of textarea', '+', {
    category: 'editing'
  });
  Hotkeys().on('increase size of textarea', function () {
    var textarea = getTextEditorInstance().get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 1.2 + ' ' + oldScale.y * 1.2 + ' ' + 1);
  });

  Hotkeys.register('increase size of textarea', '+', {
    category: 'editing'
  });

  Hotkeys().on('increase size of textarea', function () {
    var textarea = getTextEditorInstance().get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 0.8 + ' ' + oldScale.y * 0.8 + ' ' + 1);
  });

  // FIXME not working ..
  Hotkeys.register('teleport to next region', 'shift+t', {
    category: 'editing'
  });

  Hotkeys().on('teleport to next region', function () {
    var el = $('[editable-region]')[2];
    var targetLocation = el.object3D.position;
    targetLocation.y += 20;
    setPosition(getPlayer(), targetLocation.x + ' ' + targetLocation.y + ' ' + targetLocation.z);
  });

  Hotkeys.register('load sketchfab browser', 'shift+l', {
    category: 'editing'
  });

  Hotkeys().on('load sketchfab browser', loadSketchfabBrowser);

  Hotkeys.register('export element you look at', 'shift+e', {
    category: 'editing'
  });
  Hotkeys().on('export element you look at', exportElementUnderCursor);

  Hotkeys.register(ACTIONS.undo, 'ctrl+z', {
    category: 'editing'
  });
  Hotkeys().on(ACTIONS.undo, function () {
    UndoMgr.undo();
  });

  Hotkeys.register(ACTIONS.redo, 'ctrl+y', {
    category: 'editing'
  });
  Hotkeys().on(ACTIONS.redo, function () {
    UndoMgr.redo();
  });

  // debugging

  Hotkeys.register('show region performance', 'i', {
    category: 'debug'
  });
  Hotkeys().on('show region performance', function () {
    document.querySelectorAll('[editable-region]').forEach(r => console.log(r.showPerfInfo()));
  });

  Hotkeys.register('show scripts performance', 'p', {
    category: 'debug',
    description: ''
  });
  Hotkeys().on('show scripts performance', () => openOptionsDialog('performance'));

  Hotkeys.register('show layers dialog', 'l', {
    category: 'debug',
    description: 'The layers dialog provides the option to show or hide specific layers of objects within the scene'
  });
  Hotkeys().on('show layers dialog', () => openOptionsDialog('layers'));

  // ------------------------------------
  Hotkeys.register('test server connectivity', 'shift+1', {
    category: 'debug'
  });

  Hotkeys().on('test server connectivity', function () {
    connectToServer().then(function () {
      toast('connected to database');
    }).catch(function (e) {
      console.error(e);
      toast('no database connection');
    });
  });

  // FIXME no data in json
  Hotkeys.register('test load from server', 'shift+2', {
    category: 'debug'
  });

  Hotkeys().on('test load from server', function () {
    getSomeSampleData().then(function (json) {
      console.log('json', arguments);
    }).catch(function (e) {
      console.error(e);
    });
  });

  // ------------------------------------
}
