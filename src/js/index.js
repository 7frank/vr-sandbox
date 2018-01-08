'use strict';
// Dependencies we load from vendor.js
import 'aframe';
import 'aframe-physics-system';
import 'aframe-mouse-cursor-component';

// project entry
import './a-systems';
import './a-shaders';
import './a-components';
import './a-primitives';

// Load Application
import './a-project';

import $ from 'jquery';

import debounce from 'lodash.debounce';
import trim from 'lodash.trim';

// import DiffDOM from 'diff-dom';

if (module.hot) {
  module.hot.accept();
}
// Load html
let aScene = require('../scene/index.hbs');
document.addEventListener('DOMContentLoaded', function () {
  document.body.innerHTML = aScene({
    defaults: {
      camera: {
        position: '0 0 3.8'
      },
      sky: {
        color: '#ECECEC'
      }
    }
  });
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

document.addEventListener('DOMContentLoaded', function () {
  var elem = document.querySelector('.overlay-editor .content-area');

  elem.value = `



  <a-sphere dynamic-body position="0 10.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
    <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#7BC8A4" static-body ></a-plane>

   <a-box static-body position="0 0 50" width="100" height="10" color="red" static-body ></a-box>
   <a-box static-body position="0 0 -50" width="100" height="10" color="red" static-body ></a-box>

   <a-box static-body position="50 0 0" rotation="0 90 0" width="100" height="10" color="yellow" static-body ></a-box>
   <a-box static-body position="-50 0 0" rotation="0 90 0" width="100" height="10" color="yellow" static-body ></a-box>




    <a-sky color="#ECECEC"></a-sky>
   <a-box position="-2 5.5 -3" rotation="0 45 0" color="#4CC3D9" dynamic-body  width="1" height="1" depth="1"></a-box>
   
  `;

  function initSceneFromTextarea () {
    console.log('changed');
    // var scene = document.querySelector('#aframe-project');

    // var el = htmlToElement(trim(elem.value));
    // console.log('el:', el);
    // scene.innerHTML += elem.value;
    // scene.appendChild(el);

    // document.querySelector('a-scene').append(el);

    // $('a-scene').append(trim(elem.value));
    var copy = $(
      `<a-scene id="aframe-project" physics="debug: true">
        <a-camera  static-body look-controls mouse-cursor></a-camera>
        </a-scene>`).append(trim(elem.value));

    $('a-scene').replaceWith(copy);

    var playerEl = document.querySelector('a-sphere');
    console.log('sphere' + playerEl);
    playerEl.addEventListener('collide', function (e) {
      console.log('Player has collided with body #' + e.detail.body.id, e.detail.target);

      e.detail.target.el.setAttribute('position', {y: 20});
      e.detail.target.el.flushToDOM();

    /*  e.detail.target.el; // Original entity (playerEl).
      e.detail.body.el; // Other entity, which playerEl touched.
      e.detail.contact; // Stats about the collision (CANNON.ContactEquation).
      e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
      */
    });

    // $('a-scene').get(0).originalHTML=trim(elem.value)
    //   $('a-scene').get(0).reload();
    // TODO diffing not working
    /* var dd = new DiffDOM();

    var sceneOld = $('a-scene');
    var sceneNew = $('<a-scene>').append(trim(elem.value));

    var diff = dd.diff(sceneOld, sceneNew);
    dd.apply(sceneOld, diff);
 */
  }

  initSceneFromTextarea();

  elem.addEventListener('keypress', debounce(initSceneFromTextarea, 1000));
});
