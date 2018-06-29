import $ from 'jquery';
import {findClosestEntity, getDirectionForEntity} from '../utils/aframe-utils';

import pretty from 'pretty';
import {getHotkeyDialog, getTextEditorInstance} from './utils';

// ---------------------------------

var previousFocus = null;

function updateContentArea () {
  var content = getTextEditorInstance().get(0).parentElement.parentElement.querySelector('.content');
  var taComponent = getTextEditorInstance().get(0).components.textarea;

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

// -------------------------------------
// FIXME refactor into class
var inited = false;

function initTetAreaListener () {
  if (inited) return;
  setTimeout(function () {
    if (!getTextEditorInstance().get(0) || !getTextEditorInstance().get(0).components) return;

    var taComponent = getTextEditorInstance().get(0).components.textarea;

    // $(taComponent.textarea).on('change', updateContentArea);
    getTextEditorInstance().get(0).addEventListener('text-changed', updateContentArea);

    // TODO as soon as mouse events can be used as actions this shiould be customisable as well (say for example a user wants to be able to bind "esc")
    getTextEditorInstance().get(0).addEventListener('mouseenter', function () {
      startEditingTextarea();
    });

    getTextEditorInstance().get(0).addEventListener('mouseleave', function () {
      stopEditingTextarea();
    });

    inited = true;
  });
}

function setTextAreaOpacity (newOpacity) {
  var textarea = getTextEditorInstance().get(0);
  var tat = textarea.components.textarea;
  tat.background.setAttribute('material', 'opacity: ' + newOpacity + '; transparent: true');
}

// -------------------------------
var lastEditedElement = $([]);

export
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
    getHotkeyDialog().pause();

    return;
  }

  // TODO once
  initTetAreaListener();

  // TODO the textare might or might not be better at the player position
  $(editorContainer).append(getTextEditorInstance());

  // TODO below code will break rendering
  // $('.player').append(getTextEditorInstance());
  // getTextEditorInstance().get(0).setAttribute('position', '0 0 -1');

  textarea = getTextEditorInstance().get(0);

  var contentArea = target.querySelector('.content');
  var content = pretty(contentArea.innerHTML);

  //    font: https:// cdn.aframe.io/fonts/mozillavr.fnt;
  //    text="text: Hello World; font: ../fonts/DejaVu-sdf.fnt;

  // NOTE: there is no need to encodeURI content. besides doing so will break the textarea component
  textarea.setAttribute('textarea', `text:${content}`);

  focusTextArea();
  getHotkeyDialog().pause();
}

function stopEditingTextarea () {
  // select and bring-into-view
  // open textarea

  updateContentArea();
  setTextAreaOpacity(0.5);

  var textarea = getTextEditorInstance().get(0);
  textarea.components.textarea.textarea.blur();

  getHotkeyDialog().unpause();

  // TODO bug rendering font when re-adding?
  // getTextEditorInstance().remove();

  // hide menu again
  lastEditedElement.find('#editable-actor-start-btn').children().attr('visible', false);
}

/**
 *
 * the  editable-actor is an encapsulation for smaller parts of a world inside a editable-region
 *
 *
 */

AFRAME.registerComponent('editable-actor', {
  init: function () {
    var el = this.el;

    this.createEditableNode($(el));
  },
  createEditableNode: function (container) {
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
    var element = $(`<a-entity class="editable-actor" >
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
    });
  }

});
