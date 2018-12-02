import $ from 'jquery';
import {_setPosition, getClosestEditableRegion, setPosition, toast} from './utils/aframe-utils';

import {MainMenuStack} from './types/MenuStack';

import {getTextEditorInstance} from './a-editable/utils';
import {startEditingTextarea} from './a-editable/editable-actor';
import {ImpactGUI} from './utils/performance-utils';

import {createHTML} from './utils/dom-utils';
import {openOptionsDialog} from './gameOptionsDialog';
import {activateJetpack, getPlayer, getPositionInFrontOfEntity, playerKickBall} from './game-utils';

import {attachCodeEditor} from './reafactor.stuff';
import {enterOrExitVehicle} from './car.refactor';
import {createEditableNode} from './editing-utils';
import {loadSketchfabBrowser} from './sketchfab/sketchfab-render';
import {exportElementUnderCursor} from './export/GLTF-exporter-utils';
import {UndoMgr} from './utils/undo-utils';
import {connectToServer, queryAPI} from './database-utils';
import {createSidebarToggleIcon} from './utils/debug-gui';
import * as _ from 'lodash';

import waitUntil from 'wait-until';
import {renderRegionFromDatabase} from './region-utils';
import {showAssetDialog} from './asset-menu/assets-ds';

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

  // TODO for testing
  AFRAME.nk.Hotkeys = Hotkeys;
  hotkeyDialog = createHTML("<nk-hotkey-dialog title='Input Configuration' class='card card-1' style='z-index: 1;top:50px;left:50%;position:absolute;width:600px;height:300px;display:none' ></nk-hotkey-dialog>");
  document.body.appendChild(hotkeyDialog);
  //
  addHotkeys();

  // depends on hotkeys
  createSidebarToggleIcon();

  hideLocalPlayer();

  connectServer();
});

var serverConnected = false;

function connectServer () {
  connectToServer().then(function () {
    serverConnected = true;
    // toast('connected to database');
  }).catch(function (e) {
    toast('no database connection: ' + e.statusText, 99999);
  });
}

function hideLocalPlayer () {
  waitUntil()
    .interval(200)
    .times(Infinity)
    .condition(() => {
      return !!getPlayer().querySelector('.avatar');
    })
    .done((result) => {
      getPlayer().querySelector('.avatar').setAttribute('visible', false);
    });
}

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
    redo: 'redo',
    openAssetDialog: 'Open asset dialog.'
  };

  Hotkeys.setDebug(false);
  Hotkeys.onChange(function (result) {
    console.log('Hotkeys-change', result);
  });

  Hotkeys.register('show help', 'h');
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

  Hotkeys.register('toggle-main-menu', 'F2', {
    category: 'HUD'
  });

  Hotkeys().on('toggle-main-menu', _.throttle(function () {
    var visible = !document.querySelector('#m-main-menu').object3D.visible;

    var hud = document.querySelector('[hud-hud]');
    if (visible) {
      MainMenuStack.push('m-main-menu');
    } else {
      MainMenuStack.push('player-hud');
    }

    let state = visible ? 'mouse' : 'entity';

    // FIXME the cursor needs to be detached to be able to switch from mouse to entity mode
    var c = document.querySelector('[cursor]');
    c.removeAttribute('cursor');
    c.setAttribute('cursor', 'rayOrigin', state);

    // toggle cursor visiblility
    c.setAttribute('visible', !visible);

    // FIXME
    // var l = document.querySelector('[look-controls]');
    // c.removeAttribute('look-controls');
    //  c.setAttribute('look-controls', 'pointerLockEnabled', !visible);

    // toast('cursor rayOrigin: ' + state);
  }, 100));

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

  /* alert("we can 'R' but not move");

              $('a-scene').setAttribute('cursor-focus', true);
              sphere = document.activeElement;
              sphere.addEventListener('keyup', (...args) => console.log('key', args, args[0].which));
              */

  // ----------------------------------------------
  // FIXME controls are overloaded and will work despite these wasd controls below not being active
  Hotkeys.register('player-move-forward', ['w', 'up', 'touch'], {
    category: 'player',
    description: 'Moves the player in the forward direction.',
    stopPropagation: false
  });
  Hotkeys.register('player-move-backward', ['s', 'down'], {
    category: 'player',
    description: 'Moves the player in the backward direction.',
    stopPropagation: false
  });
  Hotkeys.register('player-strafe-left', ['a', 'left'], {
    category: 'player',
    description: 'Moves the player  sideways.'
  });

  Hotkeys.register('player-strafe-right', ['d', 'right'], {
    category: 'player',
    description: 'Moves the player  sideways.'
  });

  Hotkeys.register('player-rotate-left', ['q'], {
    category: 'player',
    description: 'Rotates the player.'
  });
  Hotkeys.register('player-rotate-right', ['e'], {
    category: 'player',
    description: 'Rotates the player.'
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
  Hotkeys.register('interaction-pick', 'r', {
    category: 'interaction',
    description: 'Will try to interact with the entity in front of the player. '
  });

  Hotkeys().on('interaction-pick', () => {
    toast('nothing to pick up');
  }); // enterOrExitVehicle);

  Hotkeys.register('interaction-talk', 't', {
    category: 'interaction',
    description: 'Lets player enter the vehicle and switches from player camera to car camera.'
  });

  Hotkeys().on('interaction-talk', () => {
  });

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

  Hotkeys.register('action-increase', '+', {
    category: 'editing',
    description: 'increase size of an element (like textarea)'
  });
  Hotkeys().on('action-increase', function () {
    var textarea = getTextEditorInstance().get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 1.2 + ' ' + oldScale.y * 1.2 + ' ' + 1);
  });

  Hotkeys.register('action-decrease', '-', {
    category: 'editing',
    description: 'decrease size of an element (like textarea)'
  });

  Hotkeys().on('action-decrease', function () {
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

  Hotkeys.register(ACTIONS.openAssetDialog, 'ctrl+f', {
    category: 'editing'
  });
  Hotkeys().on(ACTIONS.openAssetDialog, function () {
    // asset dialog will be a list of text. a selected element is loaded in the preview window if a default loader exists
    // toggleAssetDialog()

    showAssetDialog();
  });

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

  // TODO glitches out when reloading multiple times
  var templateEditor = createHTML(`<a-entity><a-entity gui-model-preview position="-1 4 0" scale="1 1 1"  simple-billboard></a-entity></a-entity>`);
  Hotkeys.register('toggle-template-editor', 'shift+tab', {
    category: 'editing'
  });
  Hotkeys().on('toggle-template-editor', function () {
    let scene = document.querySelector('a-scene');
    let region = getClosestEditableRegion(scene);

    if (templateEditor.parentElement == null) {
      region.appendChild(templateEditor);
      let pos = getPositionInFrontOfEntity(getPlayer(), 5);

      _setPosition(templateEditor, pos);
    } else {
      templateEditor.parentElement.removeChild(templateEditor);
    }
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

  // FIXME no data in json
  Hotkeys.register('test load from server', 'shift+2', {
    category: 'debug'
  });

  Hotkeys().on('test load from server', function () {
    if (!serverConnected) { toast('server offline'); } else {
      queryAPI('/region').then(function (regions) {
        console.log('regions', regions);
        _.each(regions, (region, i) => renderRegionFromDatabase(region, i));
      }).catch(function (e) {
        console.error(e);
      });
    }
  });

  // ------------------------------------
}
