import {getPlayer} from './game-utils';
import {getDirectionForEntity} from './utils/aframe-utils';

import $ from 'jquery';

var hotkeyDialog;
/**
 *
 * @param hkDialog - we need a reference to the dialog and its hotkeys to disable them while the textarea does have the focus
 */
export
function createEditableNode (hkDialog) {
  hotkeyDialog = hkDialog;

  // raytrace to position
  // create element at
  var player = getPlayer();

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
