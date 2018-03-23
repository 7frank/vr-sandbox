'use strict';
// Dependencies we load from vendor.js

import 'aframe';

import 'three-vrcontrols'; // currently missing from (aframe 0.8.1) for aframe-extras(3.1.3)

import 'aframe-physics-system';
import 'aframe-mouse-cursor-component';
// import 'aframe-extras/dist/aframe-extras.controls';
import 'aframe-extras/dist/aframe-extras';
import 'aframe-environment-component/dist/aframe-environment-component.min.js';
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

import debounce from 'lodash.debounce';
import trim from 'lodash.trim';

import DiffDOM from 'diff-dom';

import {
  onAFrameAttributeChange, onAttributeChange, onElementChange, onTagChanged,
  onXYZAFrameChange
} from './network-sync';
import {attachGameLogic} from './ballGameLogic';
import * as _ from 'lodash';
import {addLoadingListenersToScene} from './utils/loadingBarUtils';
import ZoomUtils from './utils/ZoomUtils';
import {querySelectorAll} from './utils/selector-utils';
import {Layers} from './types/Layers';

import {createTextSampleCanvas, renderTextToCanvas} from './gui/handwriting';
import {streamIn} from './utils/stream-utils';

// if we really want to have a partially global object for debugging this should go into a separate file then..
AFRAME.nk = {querySelectorAll, ZoomUtils, Layers, streamIn};

// ------------------

// ----------------
//
// NOTE:Make sure that Bootstrap's CSS classes are included in your HTML.
// global.jQuery = global.$ = $;

// require('bootstrap');
// require('@gladeye/aframe-preloader-component');
// NOTE:use below approach if component above is not sufficient
/* var manager = document.querySelector('a-assets').fileLoader.manager
 manager.onStart=function(){
     console.log(arguments)

 };
*/
/*
onAttributeChange(undefined, 'position', function () {
  console.log('------------------------------');
  console.log('changed element:', arguments);
});
*/

// TODO track all elements with a position attribute (for now estimate that those are a-frame elements)
/* onXYZAFrameChange('[position]', function (evt) {
   console.log('Entity has moved from', evt, evt.detail, evt.detail.oldData, 'to', evt.detail.newData, '!');
});
*/
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
  reloadSceneToDOM();
});

/**
 // load etherpad frame
 document.addEventListener('DOMContentLoaded', function () {
  var iframe = document.querySelector('.overlay-editor');
  iframe.src = 'http://' + window.location.hostname + ':85/p/helloEtherpad';
  console.log(iframe);
});
 */

// listening for changes of a-scene like added removed
onTagChanged('a-scene', function (elementsInfo) {
  console.log('onTagChanged a-scene');

  // console.log('a-scene changed', elementsInfo);

  function initScene (scene) {
    scene.setAttribute('visible', false);

    addLoadingListenersToScene(elementsInfo.added[0], function () {
      scene.setAttribute('visible', true);

      /*   var ball = $('.ball');
                  // ball.removeAttribute("dynamic-body");
                  ball.attr('position', '0 2 ' + _.random(-5, 15));
                  console.log('initial ball position', ball.attr('position'));
                  */
      attachGameLogic();
    });
  }

  // the first time called, this will attach logic for nothing as the initial scene is empty
  if (elementsInfo.added.length > 0) {
    initScene(elementsInfo.added[0]);
  }
});

// --------------------------------------

function reloadSceneToDOM () {
  console.log('reloadSceneToDOM');
  $('body').addClass('splash-screen');

  var loadingInfoText = createTextSampleCanvas();

  var elem = document.querySelector('.overlay-editor .content-area');

  var content = require('../staticContent.hbs');

  elem.value = content();

  function staticUpdateScene () {
    var sceneDefinition = require('../sceneDefinition.hbs');

    var copy = $(sceneDefinition()).append(trim(elem.value));

    // FIXME no longer detecting loaded
    /*  copy.get(0).addEventListener('loaded', function () {
              console.log('scene was loaded');
              setTimeout(function () {
                copy.attr('visible', true);
              }, 500);
            }); */

    $('a-scene').replaceWith(copy);

    $('body').append(`
    
    
    <style type="text/css">
    #target {
      width: 512px;
      height: 256px;
      position: absolute;
      background: rgba(255,255,0,0.3);
    }
    #htmlTarget.hide {
      z-index: -1;
    }
    #target h1 {
      font-family: Arial;
      font-size: 110px;
      margin: 0;
      vertical-align: top;
      color: white;
    }
    #target h1 span {
      color: tomato;
    }
    #emoji {
      position: absolute;
      font-size: 512px;
      color: mediumTurquoise;
      font-style: serif;
    }
    #pre {
      font-family: monospace;
      margin: 0;
      padding: 0;
      height: 50px;
      font-size: 50px;
      background: royalblue;
      color: tomato;
    }
    #htmlTarget {
      position: absolute;
      z-index: 1;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    #debug {
      position: absolute;
      bottom: 0;
      left: 0;
    }
    @media (max-width: 512px) {
      #target {
        width: 256px;
        height: 126px;
      }
      #target h1 {
        font-size: 55px;
      }
      #pre {
        height: 50px;
        font-size: 25px;
      }
      #emoji {
        position: absolute;
        font-size: 256px;
        color: mediumTurquoise;
      }
    }
    body[data-vr="true"] .novr{
      display: none;
    }
    </style>
    
      <div id="htmlTarget" class="hide">
      <div id="emoji">〠</div>
      <div id="target">
        <h1>HELLO<span>★</span></h1>
        <span id="pre">A</span>
      </div>
    </div>
    <div id="debug" class="novr_2"></div>
  
  `);

    // ----------------------------------
  }

  function diffUpdateScene () {
    // TODO test if the diffing has the wanted result of increasing load times of area as well as reducing uneccessary computations
    var dd = new DiffDOM();

    var sceneOld = $('a-scene').get(0);
    var sceneNew = $('<a-scene>').append(trim(elem.value)).get(0);

    var diff = dd.diff(sceneOld, sceneNew);
    console.log(sceneOld, sceneNew, diff);
    // dd.apply(sceneOld, diff);
  }

  function initSceneFromTextarea (staticUpdate = true) {
    console.log('changed');
    // var scene = document.querySelector('#aframe-project');

    // var el = htmlToElement(trim(elem.value));
    // console.log('el:', el);
    // scene.innerHTML += elem.value;
    // scene.appendChild(el);

    // document.querySelector('a-scene').append(el);

    // $('a-scene').append(trim(elem.value));

    if (staticUpdate) {
      staticUpdateScene();
    } else {
      diffUpdateScene();
    }

    // $('a-scene').get(0).originalHTML=trim(elem.value)
    //   $('a-scene').get(0).reload();
  }

  initSceneFromTextarea();

  elem.addEventListener('keypress', debounce(initSceneFromTextarea, 2000));

  addListeners();
}

/**
 * for those of us that want to use aframe with desktop
 * //TODO improve
 */
function addListeners () {
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
}
