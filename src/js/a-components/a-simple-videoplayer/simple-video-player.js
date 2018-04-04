import $ from 'jquery';
import {AVideoPlayer} from './AVideoPlayer';

var styleTemplate = `


    <style type="text/css">
      #video-permission {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          z-index: 10000;
          display: none;
      }

      #video-permission-button {
        position: fixed;
        top: calc(50% - 1em);
        left: calc(50% - 60px);
        width: 120px;
        height: 2em;
      }
    </style>

 

`;

var permissionTemplate = `
    <div id="video-permission">
      <button id="video-permission-button">Allow VR video</button>
    </div>
`;

var assetsTemplate = `


      <a-assets>
        <img src="assets/a-simple-videoplayer/play.png" id="play" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/pause.png" id="pause" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/volume-normal.png" id="volume-normal" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/volume-mute.png" id="volume-mute" crossorigin="anonymous">
        <img src="assets/a-simple-videoplayer/seek-back.png" id="seek-back" crossorigin="anonymous">
      </a-assets>

      <a-assets>
        <img src="assets/a-simple-videoplayer/white_grid_thin.png" id="grid" crossorigin="anonymous">
      
      </a-assets>


     

`;

var playerAndControlsTemplate = `
       <video id="video-src" src="assets/a-simple-videoplayer/interstellar.mp4" crossorigin="anonymous"></video>
      <!-- MEDIAS HOLDER -->
      <a-sound id="alert-sound" src="src: url(assets/a-simple-videoplayer/action.wav)" autoplay="false" position="0 0 0"></a-sound>
      <a-video id="video-screen" src="#video-src"  width="8" height="4.5"></a-video>
      <!-- END MEDIAS HOLDER -->

    <a-entity id="controls">
      <!-- CONTROLS -->
      <a-image id="control-back" width="0.4" height="0.4" src="#seek-back" position="-0.8 0.6 0" visible="false" scale="0.85 0.85 0.85"></a-image>
      <a-image id="control-play" width="0.4" height="0.4" src="#play" position="0 0.6 0"></a-image>
      <a-image id="control-volume" width="0.4" height="0.4" src="#volume-normal" position="0.8 0.6 0" visible="false" scale="0.75 0.75 0.75"></a-image>
      <!-- END CONTROLS -->

      <!-- PROGRESSBAR -->
      <a-entity id="progress-bar" geometry="primitive: plane; width: 4; height: 0.06;"
          material="transparent: true; visible:false; opacity: 0;" position="0 0.1 0">
        <a-plane id="progress-bar-track" width="4" height="0.06" color="black" position="0 0 0.005" opacity="0.2" visible="false"></a-plane>
        <a-plane id="progress-bar-fill" width="0" height="0.06" color="#7198e5" position="-2 0 0.01" visible="false"></a-plane>
      </a-plane>
      <!-- END PROGRESSBAR -->
    </a-entity>   

      <!-- ENVIRONMENT -->
     <!-- <a-entity
          geometry="primitive: plane; width: 10000; height: 10000;" rotation="-90 0 0"
          material="src: #grid; repeat: 10000 10000; transparent: true; opacity:0.3;"></a-entity>
      <a-sky color="#dbdedb"></a-sky>
      <a-entity light="color: #FFF; intensity: 1; type: ambient;"></a-entity> -->
      <!-- END ENVIRONMENT -->

`;

// see https://gist.github.com/jsturgis/3b19447b304616f18657 for sample videos
// TODO create playlist component for it

var initedOnce = false;
AFRAME.registerComponent('simple-video-player', {
  schema: {
    video: {type: 'vec3', default: '0 3 0'},
    controls: {type: 'vec3', default: '0 0.5 0.5'},
    src: {type: 'string'}
  },
  init: function () {
    if (!initedOnce) {
      initStaticPortions(document.querySelector('a-scene'));
      initedOnce = true;
    }

    $(this.el).append($(playerAndControlsTemplate));

    createStuff(document.querySelector('a-scene'), document.querySelector('cursor'), this.el);

    this.update();
  },
  update: function () {
    console.log('update', this.data);
    this.el.querySelector('#video-screen').setAttribute('position', this.data.video);
    this.el.querySelector('#controls').setAttribute('position', this.data.controls);

    this.el.querySelector('#video-src').setAttribute('src', this.data.src);
  }

});

// TODO if it is working use the vue component
function initStaticPortions (sceneEl) {
  $('body').append($(styleTemplate), $(permissionTemplate));
  $(sceneEl).append($(assetsTemplate));
}

function createStuff (sceneEl, cursorEl, container) {
  let scene = sceneEl;// document.querySelector('a-scene');
  var cursor = cursorEl;// document.querySelector('a-cursor');

  scene.setAttribute('fog', 'type: linear; near:12; far:20; color: #dbdedb;'); // Night mode: #0c192a

  /**
     * CINEMA MODE
     * TODO might not work due to animation component missing
     * TODO also maybe have this as an optional component that depends on playercomponent so not every player darkens the environment
     */
  scene.lightOff = function () {
    scene.islightOn = true;
    scene.removeAttribute('animation__fogback');
    scene.setAttribute('animation__fog', 'property: fog.color; to: #0c192a; dur: 800; easing: easeInQuad;');
  };
  scene.lightOn = function () {
    scene.islightOn = false;
    scene.removeAttribute('animation__fog');
    scene.setAttribute('animation__fogback', 'property: fog.color; to: #dbdedb; dur: 800');
  };

  /**
     * AVideoPlayer
     */
  var videoPlayer = new AVideoPlayer(container, container.querySelector('#video-src'));

  /**
     * CURSOR
     */

  // Cursor
  /*  let hideCursor = function() {
                    cursor.removeAttribute('animation__cursorHideLeave');
                    cursor.setAttribute('animation__cursorHideEnter', "property: scale; from: 0.6 0.6 0.6; to: 0 0 0; dur: 300; easing: easeInQuad;");
                }
            let showCursor = function() {
                cursor.removeAttribute('animation__cursorHideEnter');
                cursor.setAttribute('animation__cursorHideLeave', "property: scale; from: 0 0 0; to: 0.6 0.6 0.6; dur: 300; easing: easeInQuad;");
            }
            document.querySelector('#video-screen').addEventListener('mouseenter', hideCursor);
            document.querySelector('#video-screen').addEventListener('mouseleave', showCursor);
            */
  // Play button action
  container.querySelector('#control-play').addEventListener('click', function () {
    if (videoPlayer.paused) {
      scene.lightOn();
    } else {
      scene.lightOff();
      // hideCursor();
    }
  });
}
