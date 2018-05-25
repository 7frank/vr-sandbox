'use strict';
// Dependencies we load from vendor.js
import './prototypes';
import 'aframe';

import 'three-vrcontrols'; // currently missing from (aframe 0.8.1) for aframe-extras(3.1.3)
import 'aframe-physics-system';
import 'aframe-mouse-cursor-component';
// import 'aframe-extras/dist/aframe-extras.controls';
import 'aframe-extras/dist/aframe-extras';
import 'aframe-environment-component/dist/aframe-environment-component.min.js';
import 'aframe-animation-component';
// TODO track down error to be able to test kinematic-body for player element
// import 'aframe-extras/dist/aframe-extras.misc';
// project entry
import './a-systems';
import './a-shaders';
import './a-components';
import './a-primitives';
import './a-car';

import './a-html3d/html';

import './a-editable/editable-actor';
import './a-editable/editable-region';

import './a-controls/customizable-wasd-controls';

import './interactions/attraction';
// Load Application
import './a-project';

import $ from 'jquery';

import 'networked-aframe';

import './gameHotkeys';
import trim from 'lodash.trim';

import DiffDOM from 'diff-dom';

import {onTagChanged} from './network-sync';

import * as _ from 'lodash';
import {addLoadingListenersToScene} from './utils/loadingBarUtils';
import ZoomUtils from './utils/ZoomUtils';
import {querySelectorAll} from './utils/selector-utils';
import {Layers} from './types/Layers';
import {streamIn} from './utils/stream-utils';
import {createDropZone} from './import/fileupload';
import {onDropZoneDrop} from './utils/file-drag-drop-utils';
import {createHTML as parseHTML} from './utils/dom-utils';

import Vue from 'vue/dist/vue.esm';
import {UndoMgr} from './utils/undo-utils';

import './utils/raycaster-performance-util';
import {attachClipboard} from './clipboard';

// TODO log per instance of global active inactive
// Logger.setState(true);
// if we really want to have a partially global object for debugging this should go into a separate file then..
AFRAME.nk = {querySelectorAll, ZoomUtils, Layers, streamIn, parseHTML, Vue, UndoMgr};

// ------------------

if (module.hot) {
  module.hot.accept();
}

// Load html
let aScene = require('../scene/index.hbs');

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded');
  $('body').append(aScene({
    defaults: {
      camera: {
        position: '0 0 3.8'
      },
      sky: {
        color: '#ECECEC'
      }
    }
  })
  );

  var splashScreen = $('<div><div class="splash-screen-text">Loading - VR Sandbox</div></div>').addClass('splash-screen-position splash-screen  card-5');

  $('body').append(splashScreen);
  addDefaultListeners();

  // reloadSceneToDOM();
});

// listening for changes of a-scene like added removed
// show splash screen while loading
onTagChanged('a-scene', function (elementsInfo) {
  function initScene (scene) {
    scene.setAttribute('visible', false);

    addLoadingListenersToScene(elementsInfo.added[0], function () {
      scene.setAttribute('visible', true);

      $('.splash-screen').delay(1000).fadeOut(500);

      var loadingBar = $('.loading-bar').css({position: 'fixed'});
      $('body').append(loadingBar);
    });

    $('.splash-screen').append($('.loading-bar'));
  }

  // the first time called, this will attach logic for nothing as the initial scene is empty
  if (elementsInfo.added.length > 0) {
    initScene(elementsInfo.added[0]);
  }
});

/**
 * for those of us that want to use aframe with desktop
 * drag&drop functionality
 * TODO refactor and reuse drag&drop portions and zip + other utils
 */
function addDefaultListeners () {
  var scene = $('a-scene');
  var cam = scene.camera;
  scene.on('enter-vr', function () {
    cam.fov = 80;
    cam.updateProjectionMatrix();
  });

  scene.on('exit-vr', function () {
    cam.fov = 45;
    cam.updateProjectionMatrix();
  });

  createDropZone(scene.get(0), onDropZoneDrop);

  attachClipboard();
}
