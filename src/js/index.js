'use strict';
// Dependencies we load from vendor.js
import 'aframe';
import 'aframe-physics-system';
import 'aframe-mouse-cursor-component';
import 'aframe-extras';

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

import {Hotkeys, showHotkeyList} from './Interactions';

import debounce from 'lodash.debounce';
import trim from 'lodash.trim';

import DiffDOM from 'diff-dom';
import CarCameraControls from './a-car/car/CarCameraControls';

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

document.addEventListener('DOMContentLoaded', function () {
  $('body').addClass('splash-screen');

  var elem = document.querySelector('.overlay-editor .content-area');

  elem.value = `


<!-- 
 <a-car  position="0 10.25 -5" ></a-car>
 <a-entity simple-car position="0 1 -10"></a-entity> 
-->


<a-simple-car position="0 10.25 -15" dynamic-body="shape: box; mass: 30" scale="4 4 4"   ></a-simple-car>

  <a-sphere class="ball" shadow="cast: true; receive: true" material="repeat:0.1 0.1"   src="/assets/images/grids/metal8.jpg"  dynamic-body="mass:0.5 ;angularDamping:0.01;linearDamping:0.01" position="0 10.25 -5" radius="1.25" color="#EF2D5E">
    <a-sound  class="sound-ball-bounce" src="src: url(assets/audio/rubber_ball_bounce_dirt_01.mp3)" autoplay="false" volume=0.4 ></a-sound> 
  </a-sphere>



   <a-cylinder shadow="cast: true; receive: true" static-body position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
   <a-box shadow="cast: true; receive: true"  position="-2 5.5 -3" rotation="0 45 0" color="#4CC3D9" dynamic-body  width="1" height="1" depth="1"></a-box>

<a-entity scale="0.8 1 0.5">
   
   
 <a-plane class="goal" src="/assets/images/grids/metal1.jpg"  shadow="cast: true; receive: true" position="50 0 0" rotation="0 90 0" color="white"  static-body="shape:hull" material="side: double" height="8" width=20></a-plane>

<a-plane class="goal" src="/assets/images/grids/metal1.jpg"  shadow="cast: true; receive: true" position="-50 0 0" rotation="0 90 0" color="white"  static-body="shape:hull" material="side: double" height="8" width=20></a-plane>   
   
   
   
<a-plane class="floor" shadow="cast: false; receive: true" src="/assets/images/grids/Soccer-Football-Field-Lines.jpg" position="0 0 0" rotation="-90 0 0" width="150" height="150" color="#7BC8A4" static-body ></a-plane> 

<!--    <a-box position="0 0 0" material="repeat:2 2" src="/assets/images/grids/metal6.jpg"  color="#7BC8A4" static-body  width="100" height="1" depth="100"></a-box> -->



<a-cylinder class="border"   shadow="cast: false; receive: true"  open-ended=true repeat="0.1 1" src="/assets/images/grids/metal1.jpg" segments-height=1 segments-radial=18  position="50 4 0" rotation="90 0 0" color="#FFC65D"  static-body="shape:hull" material="side: double" theta-length=90 radius="5" height="110"></a-cylinder>

<a-cylinder class="border"  shadow="cast: false; receive: true"  open-ended=true  repeat="0.1 1" src="/assets/images/grids/metal1.jpg" segments-height=1 segments-radial=18   position="0 4 50" rotation="90 270 0" color="grey"  static-body="shape:hull" material="side: double" theta-length=90 radius="5" height="110"></a-cylinder>

<a-cylinder class="border"  shadow="cast: false; receive: true"  repeat="0.1 1" open-ended=true src="/assets/images/grids/metal1.jpg" segments-height=1 segments-radial=18   position="-50 4 0" rotation="90 180 0" color="blue"  static-body="shape:hull" material="side: double" theta-length=90 radius="5" height="110"></a-cylinder>

<a-cylinder class="border"  shadow="cast: false; receive: true"  repeat="0.1 1" open-ended=true src="/assets/images/grids/metal1.jpg" segments-height=1 segments-radial=18   position="0 4 -50" rotation="90 90 0" color="green"  static-body="shape:hull" material="side: double" theta-length=90 radius="5" height="110"></a-cylinder>

</a-entity>

<a-sky color="#ECECEC"></a-sky>



  

  `;

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
    var copy = $(
      `<a-scene light="shadowMapType: basic" visible="false" id="aframe-project" physics="debug: true">
        <a-camera class="player" static-body="shape:sphere;sphereRadius:1" ></a-camera> 
        
         <a-sound  src="src: url(assets/audio/22 Monkey Fight Menu.mp3)" autoplay="true" loop="true"  volume=0.7 position="0 2 5"></a-sound>
         <a-sound  class="sound-cheer" src="src: url(assets/audio/Large_Stadium-stephan_schutze-2122836113.mp3)" autoplay="false" volume=0.4 ></a-sound>   
         <a-sound  class="sound-ball-bounce" src="src: url(assets/audio/rubber_ball_bounce_dirt_01.mp3)" autoplay="false" volume=0.4 ></a-sound>
     
      <a-plane class="limbo" shadow="cast: false; receive: false" src="/assets/images/grids/Soccer-Football-Field-Lines.jpg" position="0 -100 0" rotation="-90 0 0" width="10000" height="10000" color="#7BC8A4" static-body ></a-plane> 
  
        
      <!--    <a-entity camera universal-controls="fly:true" position="0 5 0" jump-ability kinematic-body></a-entity> -->
        </a-scene>`).append(trim(elem.value));

    copy.get(0).addEventListener('loaded', function () {
      console.log('scene was loaded');
      setTimeout(function () {
        copy.attr('visible', true);
      }, 500);
    });

    $('a-scene').replaceWith(copy);

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
        // setPosition($('.player').get(0), '-5 1 0');
        $('a-camera').attr('position', '0 1 0');
      }
    });

    var ballEl = document.querySelector('a-sphere');
    console.log('sphere' + ballEl);
    ballEl.addEventListener('collide', function (e) {
      var targetEl = e.detail.body.el;

      playSound('.sound-ball-bounce');

      console.log('ball has collided with body', targetEl.tagName, targetEl.getAttribute('class'));

      if (!$(targetEl).hasClass('floor')) {
        if (!targetEl.__origColor__) targetEl.__origColor__ = targetEl.getAttribute('color');

        targetEl.setAttribute('color', 'red');

        setTimeout(function () { targetEl.setAttribute('color', targetEl.__origColor__); }, 500);
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

    if (staticUpdate) { staticUpdateScene(); } else { diffUpdateScene(); }

    // $('a-scene').get(0).originalHTML=trim(elem.value)
    //   $('a-scene').get(0).reload();
  }

  initSceneFromTextarea();

  elem.addEventListener('keypress', debounce(initSceneFromTextarea, 2000));
});
