'use strict';
// Dependencies we load from vendor.js
import 'aframe';

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
  <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
    <a-sky color="#ECECEC"></a-sky>
   <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
  
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
    var copy = $('<a-scene>').append(trim(elem.value));

    $('a-scene').replaceWith(copy);

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
