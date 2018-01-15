'use strict';
// Dependencies we load from vendor.js
import 'aframe';
import 'aframe-physics-system';
import 'aframe-mouse-cursor-component';
import 'aframe-extras/dist/aframe-extras.controls';

// TODO track down error to be able to test kinematic-body for player element
// import 'aframe-extras/dist/aframe-extras.misc';

import CANNON from 'cannon';

// project entry
import './a-systems';
import './a-shaders';
import './a-components';
import './a-primitives';
import './a-car';

// Load Application
import './a-project';

import $ from 'jquery';

import 'networked-aframe';

import {Hotkeys, showHotkeyList} from './Interactions';

import debounce from 'lodash.debounce';
import trim from 'lodash.trim';

import DiffDOM from 'diff-dom';
import CarCameraControls from './a-car/car/CarCameraControls';
import OptionsDialog from './dialogs/options/OptionDialog';

import {
  onAFrameAttributeChange, onAttributeChange, onElementChange, onTagChanged,
  onXYZAFrameChange
} from './network-sync';

// ------------------

// ----------------
//
// NOTE:Make sure that Bootstrap's CSS classes are included in your HTML.
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

// track all elements with a position attribute (for now estimate that those are a-frame elements)
onXYZAFrameChange('[position]', function (evt) {
  // console.log('Entity has moved from', evt, evt.detail, evt.detail.oldData, 'to', evt.detail.newData, '!');
});

if (module.hot) {
  module.hot.accept();
}
// Load html
let aScene = require('../scene/index.hbs');
document.addEventListener('DOMContentLoaded', function () {
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
});

/**
 // load etherpad frame
 document.addEventListener('DOMContentLoaded', function () {
  var iframe = document.querySelector('.overlay-editor');
  iframe.src = 'http://' + window.location.hostname + ':85/p/helloEtherpad';
  console.log(iframe);
});
 */

/*
function htmlToElement (html) {
  var template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstChild;
} */
Hotkeys('show help', 'h', function () {
  showHotkeyList();
});

var optionsDialog;
Hotkeys('show help', 'o', function () {
  if (!optionsDialog) {
    optionsDialog = new OptionsDialog();
  } else optionsDialog.$.toggle();
});

// ---------------------------------------------------
Hotkeys('accelerate  car forward', 'i', () => {
  window.car._car.controls().moveForward = true;
}, () => {
  window.car._car.controls().moveForward = false;
});

Hotkeys('accelerate  car backward', 'k', () => {
  window.car._car.controls().moveBackward = true;
}, () => {
  window.car._car.controls().moveBackward = false;
});

Hotkeys('steer car left', 'j', () => {
  window.car._car.controls().moveLeft = true;
}, () => {
  window.car._car.controls().moveLeft = false;
});

Hotkeys('steer car right', 'l', () => {
  window.car._car.controls().moveRight = true;
}, () => {
  window.car._car.controls().moveRight = false;
});

// ---------------------------------------------------

Hotkeys('toggle follow car with camera', '+', function () {
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
});

Hotkeys('toggle overlay editor', '#', function () {
  $('.overlay-editor').toggle();
});

Hotkeys('kick ball', 'space', function () {
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
});

function playSound (assetSelector, duration = -1) {
  $.each($(assetSelector), function () {
    this.components.sound.playSound();
  });

  if (duration > 0) {
    setTimeout(function () {
      $.each($(assetSelector), function () {
        this.components.sound.stopSound();
      });
    }, duration);
  }
}

// listening for changes of a-scene like added removed
onTagChanged('a-scene', function (elementsInfo) {
  // console.log('a-scene changed', elementsInfo);

  if (elementsInfo.added.length > 0) { onSceneAddedToDOM(elementsInfo.added[0]); }
});

/*
var manager = document.querySelector('a-assets').fileLoader.manager
manager.onStart=function(){
    console.log(arguments)

};
*/

// TODO
// document.addEventListener('DOMContentLoaded', initScene);

function onSceneAddedToDOM (scene) {
  $('body').addClass('splash-screen');
  console.log('on scene added to dom');
  var elem = document.querySelector('.overlay-editor .content-area');

  var content = require('../staticContent.hbs');

  elem.value = content();

  function setPosition (el, v) {
    var arr = v.split(' ');

    var v2 = {x: Number(arr[0]), y: Number(arr[1]), z: Number(arr[2])};
    console.log(v);
    if (el.body != null && el.body.position != null) {
      el.body.position.copy(v2);
      el.body.velocity.set(0, 0, 0);
    } else el.setAttribute('position', v);
  }

  function staticUpdateScene () {
    var sceneDefinition = require('../sceneDefinition.hbs');

    var copy = $(sceneDefinition()).append(trim(elem.value));

    // FIXME no longer detecting loaded
    copy.get(0).addEventListener('loaded', function () {
      console.log('scene was loaded');
      setTimeout(function () {
        copy.attr('visible', true);
      }, 500);
    });

    $('a-scene').replaceWith(copy);

    // ----------------------------------
    function attachGameLogic () {
      $('.player').on('collide', function (e) {
        var targetEl = e.detail.body.el;

        // FIXME

        if ($(targetEl).hasClass('ball')) {
          //  targetEl.body.applyImpulse(
          //  e.detail.contact.ni.negate().scale(5),  //impulse
          new CANNON.Vec3().copy(targetEl.getComputedAttribute('position'));//   world position
          //   );
        }
      });

      // everything that falls down to limbo gets spawned at the center of the playing field
      $('.limbo').on('collide', function (e) {
        var targetEl = e.detail.body.el;
        setPosition(targetEl, '0 20 0');
      });

      $('.ball').on('collide', function (e) {
        var targetEl = e.detail.body.el;

        if ($(targetEl).hasClass('goal')) {
          console.log('GOAL!!!!');

          // $('.sound-cheer').get(0).components.sound.playSound();

          playSound('.sound-cheer', 3000);
          $('.goal-info-text').fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300);
          setPosition($('.ball').get(0), '0 15 0');
          // FIXME not working for .player
          // TODO also nmight not alsways be working if player is following vehicle
          // setPosition($('.player').get(0), '-5 1 0');
          $('.player').attr('position', '0 1 0');
        }
      });

      // var ballEl = document.querySelector('a-sphere');
      // console.log('sphere' + ballEl);
      // ballEl.addEventListener(
      $('.ball').on('collide', function (e) {
        var targetEl = e.detail.body.el;

        playSound('.sound-ball-bounce');

        console.log('ball has collided with body', targetEl.tagName, targetEl.getAttribute('class'));

        if (!$(targetEl).hasClass('floor')) {
          if (!targetEl.__origColor__) targetEl.__origColor__ = targetEl.getAttribute('color');

          targetEl.setAttribute('color', 'red');

          setTimeout(function () {
            targetEl.setAttribute('color', targetEl.__origColor__);
          }, 500);
        }

        e.detail.target.el.setAttribute('position', {y: 20});
        e.detail.target.el.flushToDOM();

        //  e.detail.target.el; // Original entity (playerEl).
        //  e.detail.body.el; // Other entity, which playerEl touched.
        //  e.detail.contact; // Stats about the collision (CANNON.ContactEquation).
        //  e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
      });

      // wait for some mseconds after the last collision to revert to the original color
      /*  playerEl.addEventListener('collide', debounce(function (e) {
                                  // console.log('no more collision');
                                  var targetEl = e.detail.body.el;
                                  if (targetEl.__origColor__) { targetEl.setAttribute('color', targetEl.__origColor__); }
                                }, 200)); */
    }

    setTimeout(attachGameLogic, 500);
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
}
