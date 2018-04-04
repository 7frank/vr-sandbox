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
  var CustomComponents = require('@nk/core-components/dist/bundle');
  Hotkeys = CustomComponents.Hotkeys;

  hotkeyDialog = createHTML("<nk-hotkey-dialog title='Input Configuration' class='card card-1' style='z-index: 1;top:50px;left:50%;position:absolute;width:600px;height:300px;display:none' ></nk-hotkey-dialog>");
  document.body.appendChild(hotkeyDialog);
  addHotkeys();
});

/**
 * the hotkeys might need some option (or additional flag handler) for 3d mode
 *  onKeyComboTriggered() => distance(camera,menu3d|selector)<value => useKeyCombo()
 * TODO normally an event would be bound to the selector directly which would not be the case in 3d (or would it?)
 * TODO disable hotkeys when textarea is focused
 */
function addHotkeys () {
  Hotkeys('show help', 'o', function () {
    openOptionsDialog('general');
  });

  Hotkeys('change controls', 'c', function () {
    openOptionsDialog('controls');
  });

  Hotkeys('toggle world map', 'Tab', function () {
    var worldMap = $('.the-world-map:first').get(0);
    if (worldMap.hasAttribute('world-map')) {
      worldMap.removeAttribute('world-map');
    } else worldMap.setAttribute('world-map', true);
  }, {
    category: 'HUD'
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

  // TODO this should be more like a "interact with object" button where the object determines what will happen
  Hotkeys('enter-vehicle', 'r', enterOrExitVehicle, {
    category: 'car',
    description: 'Lets player enter the vehicle and switches from player camera to car camera.'
  });

  /**
     * @deprecated not the whole scene should be edited but only smaller parts of it (actors and regions within the world)
     */
  Hotkeys('toggle overlay editor', '#', function () {
    $('.overlay-editor').toggle();
  }, {description: 'Opens an overlay editor where the current scene can be edited in.'});

  Hotkeys('kick ball', 'c', playerKickBall, {
    category: 'game play',
    description: 'Will kick the ball a small bit when the player is close enough.'
  });

  Hotkeys('activate jetpack', 'space', activateJetpack, {
    category: 'game play',
    description: 'will elevate the player by a small margin'
  });

  // scene editing

  Hotkeys('create editable node', 'b', () => createEditableNode(hotkeyDialog), {
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
    setPosition(getPlayer(), targetLocation.x + ' ' + targetLocation.y + ' ' + targetLocation.z);
  }, {
    category: 'editing'
  });

  Hotkeys('load sketchfab browser', 'shift+l', loadSketchfabBrowser, {
    category: 'editing'
  });

  Hotkeys('export element you look at', 'shift+e', exportElementUnderCursor, {
    category: 'editing'
  });

  Hotkeys('undo action', 'ctrl+z', function () {
    UndoMgr.undo();
  }, {
    category: 'editing'
  });

  Hotkeys('redo action', 'ctrl+y', function () {
    UndoMgr.redo();
  }, {
    category: 'editing'
  });

  // debugging

  Hotkeys('show region performance', 'i', function () {
    document.querySelectorAll('[editable-region]').forEach(r => console.log(r.showPerfInfo()));
  }, {
    category: 'debug'
  });

  Hotkeys('show scripts performance', 'p', () => openOptionsDialog('performance'), {
    category: 'debug',
    description: ''
  });

  Hotkeys('show layers dialog', 'l', () => openOptionsDialog('layers'), {
    category: 'debug',
    description: 'The layers dialog provides the option to show or hide specific layers of objects within the scene'
  });

  // ------------------------------------
}
