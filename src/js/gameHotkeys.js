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
import {findClosestEntity, getDirectionForEntity} from './util';

import pretty from 'pretty';

const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

function addScript (src, load) {
  var s = document.createElement('script');
  s.onload = load;
  s.setAttribute('src', src);
  document.body.appendChild(s);
  return s;
}

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

    /*  var s = document.createElement('nk-window');
                            s.title = 'Input Configuration';
                            s.innerHTML += '<nk-hotkey-list></nk-hotkey-list>';
                            s.setAttribute('style', 'top:50px;left:50%;position:absolute');
                            document.body.appendChild(s);
                        */

    var s2 = document.createElement('nk-hotkey-dialog');
    s2.id = 'dialog1';
    s2.title = 'Input Configuration';
    s2.className = 'card card-1';

    //  s2.innerHTML += '<nk-hotkey-list></nk-hotkey-list>';
    s2.setAttribute('style', 'top:50px;left:50%;position:absolute;width:600px;height:300px');
    document.body.appendChild(s2);

    s2.style.display = 'none';
  }, 1000);
}

document.addEventListener('DOMContentLoaded', handlerwrapper)
;

/**
 * the hotkeys might need some option (or additional flag handler) for 3d mode
 *  onKeyComboTriggered() => distance(camera,menu3d|selector)<value => useKeyCombo()
 * TODO normally an event would be bound to the selector directly which would not be the case in 3d (or would it)
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

  // ---------------------------------------------------
  Hotkeys('move forward', 'i', () => {
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

  // ---------------------------------------------------

  Hotkeys('toggle follow with camera', '+', function () {
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
  }, {category: 'car', description: 'Toggles the view between the player and the car camera.'});

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

    var content = ` 
                            
                              <a-box src="#boxTexture" 
                              position="0 0.5 0" 
                              rotation="0 45 45" 
                              scale="1 1 1" 
                              material="color:red">
                                <a-animation attribute="position" to="0 2 -1" direction="alternate" dur="2000"
                                  repeat="indefinite"></a-animation>
                              </a-box>`;

    var menu =
            `<a-rounded position="1 -0.5 0" width="4" height="3.1" radius="0.05" scale="0.3 0.3 0.3">
        <a-form>
            <a-button width="0.1" position="0.2 2.7 0" name="delete" id="editable-actor-delete-btn"  value="X"></a-button>
            <a-button position="0.2 2.3 0" width="3" name="primitive" label="add a sphere" value="a-sphere"></a-button>
            <a-button position="0.2 1.9 0" width="3"  name="primitive" label="add a box" value="a-box"></a-button>
         </a-form>
    </a-rounded>

   <a-entity  code-editor  position="1 1 0" ></a-entity>


`;

    // TODO dynamic-body="shape: box;mass:10;"
    var element = $(`<a-entity class="editable-actor"  position="${elPos}" rotation="0 0 0">
                            <a-entity class="editor">
                           
                            <!-- <a-box shadow="cast: true; receive: true"  color="red"   width="0.2" height="0.2" depth="0.2"></a-box> -->
                             <a-switch name="edit" id="editable-actor-start-btn" enabled="true">${menu}</a-switch>
                             
                             </a-entity>
                              <a-entity class="content" bb position="0 0 0">${content}  </a-entity>         
                             
                        </a-entity> 
                `);

    container.append(element);

    container.find('#editable-actor-start-btn').on('change', function (e) {
      var enableEditing = e.target.enabled == 'false';
      if (enableEditing) {
        startEditingTextarea();
      } else {
        stopEditingTextarea();
      }

      // FIXME there should be one toast object notifying the user
      $('<a-toast message="This is a toast" action="Got it"></a-toast>').appendTo('a-scene');
    });

    console.log(direction);
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

  // ---------------------------------

  var textEditor = $(`<a-entity class="text" look-at="src:.player" position="0 -1 2"></a-entity>`);
  var previousFocus = null;

  function updateContentArea () {
    var content = textEditor.get(0).parentElement.parentElement.querySelector('.content');
    var taComponent = textEditor.get(0).components.textarea;

    // NOTE: in case the textarea contains invalid code that would break rendering
    // TODO find out if this would impact multiplayer mode. like say we transmit invalid code without checking if it breaks the rendering .. will it halt every client connected?
    try {
      decodeURI(taComponent.text);
    } catch (e) {
      console.warn('Exception occured while decoding text', e);
      return;
    }

    console.log('updating content', taComponent.text);

    content.innerHTML = taComponent.text;
  }

  // TODO class ... refactor
  var inited = false;

  function initTetAreaListener () {
    if (inited) return;
    setTimeout(function () {
      if (!textEditor.get(0) || !textEditor.get(0).components) return;

      var taComponent = textEditor.get(0).components.textarea;

      // $(taComponent.textarea).on('change', updateContentArea);
      textEditor.get(0).addEventListener('text-changed', updateContentArea);

      // TODO as soon as mouse events can be used as actions this shiould be customisable as well (say for example a user wants to be able to bind "esc")
      textEditor.get(0).addEventListener('mouseenter', function () {
        startEditingTextarea();
      });

      textEditor.get(0).addEventListener('mouseleave', function () {
        stopEditingTextarea();
      });

      inited = true;
    });
  }

  function setTextAreaOpacity (newOpacity) {
    var textarea = textEditor.get(0);
    var tat = textarea.components.textarea;
    tat.background.setAttribute('material', 'opacity: ' + newOpacity + '; transparent: true');
  }

  var lastEditedElement = $([]);

  function startEditingTextarea () {
    // select and bring-into-view
    // open textarea

    var target = findClosestEntity('.editable-actor', '.player');

    if (!target) {
      console.warn('no target found ', '.editable-actor');
      return;
    }

    var editorContainer = target.querySelector('.editor');

    console.error('  alert("continue and fix and refactor ...")');
    alert('continue and fix');
    // hide prev and  show current menu
    lastEditedElement.find('#editable-actor-start-btn').children().attr('visible', false);
    $(editorContainer).find('#editable-actor-start-btn').children().attr('visible', true);
    lastEditedElement = $(editorContainer);

    var textarea = editorContainer.querySelector('.text');

    function loadBackupFont () {
      // TODO have a stable font backup that will maintain text also
      textarea.querySelector('[text]').setAttribute('text', 'text:test;font: assets/fonts/DejaVu-sdf.fnt');
    }

    function focusTextArea () {
      setTimeout(function () {
        if (previousFocus != textarea) {
          previousFocus = document.activeElement;
        }
        textarea.components.textarea.focus();

        textarea.components.textarea.tabIndex = -1;

        setTextAreaOpacity(0.8);

        loadBackupFont();
      }, 50);
    }

    // already attached
    if (textarea) {
      focusTextArea();
      hotkeyDialog.pause();

      return;
    }

    // TOD once
    initTetAreaListener();

    // TODO the textare might or might not be better at the player position
    $(editorContainer).append(textEditor);

    // TODO below code will break rendering
    // $('.player').append(textEditor);
    // textEditor.get(0).setAttribute('position', '0 0 -1');

    textarea = textEditor.get(0);

    var contentArea = target.querySelector('.content');
    var content = pretty(contentArea.innerHTML);

    //    font: https:// cdn.aframe.io/fonts/mozillavr.fnt;
    //    text="text: Hello World; font: ../fonts/DejaVu-sdf.fnt;

    // NOTE: there is no need to encodeURI content. besides doing so will break the textarea component
    textarea.setAttribute('textarea', `text:${content}`);

    focusTextArea();
    hotkeyDialog.pause();
  }

  function stopEditingTextarea () {
    // select and bring-into-view
    // open textarea

    updateContentArea();
    setTextAreaOpacity(0.5);

    var textarea = textEditor.get(0);
    textarea.components.textarea.textarea.blur();

    hotkeyDialog.unpause();

    // TODO bug rendering font when re-adding?
    // textEditor.remove();

    // hide menu again
    lastEditedElement.find('#editable-actor-start-btn').children().attr('visible', false);
  }

  Hotkeys('start editing nearest  node', 'n', startEditingTextarea, {
    category: 'editing',
    description: 'selects an editable node and opens a textarea to edit the content. Leave with the mousecursor to disable the textarea or enter again to resume editing.'
  });

  // TODO "live bind" this via "esc or ctrl+s or similar" to aframe-textarea-component > textarea and disable mouetrap while editing
  // Hotkeys('stop editing ', 'm', stopEditingTextarea, {category: 'editing', description: 're-enables navigation of scene'});

  Hotkeys('increase size of textarea', '+', function () {
    var textarea = textEditor.get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 1.2 + ' ' + oldScale.y * 1.2 + ' ' + 1);
  }, {
    category: 'editing'
  });

  Hotkeys('increase size of textarea', '+', function () {
    var textarea = textEditor.get(0);
    var oldScale = textarea.getAttribute('scale');
    textarea.setAttribute('scale', '' + oldScale.x * 0.8 + ' ' + oldScale.y * 0.8 + ' ' + 1);
  }, {
    category: 'editing'
  });

  // ------------------------------------
}
