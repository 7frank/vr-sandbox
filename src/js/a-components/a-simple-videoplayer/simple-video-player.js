import $ from 'jquery';
import {AVideoPlayer} from './AVideoPlayer';
import {
  assetsTemplate, permissionTemplate, playerAndControlsTemplate,
  styleTemplate
} from './simple-video-player-templates';

// used to only load certain elements once
var initedOnce = false;
// TODO if it is working use the vue component
function initStaticPortions (sceneEl) {
  $('body').append($(styleTemplate), $(permissionTemplate));
  $(sceneEl).append($(assetsTemplate));
}

/**
 * component now exposes media events of html video tag.
 * Note: see {@link https://gist.github.com/jsturgis/3b19447b304616f18657} for sample videos
 * TODO create additional playlist component
 */

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

    $(this.el).append($(playerAndControlsTemplate).clone());

    createDemoStuff(document.querySelector('a-scene'), document.querySelector('cursor'), this.el);

    this.patchIDs();
  },
  patchIDs: function () {
    // patch ids
    var uuid = THREE.Math.generateUUID();
    this.el.querySelector('.video-src').setAttribute('id', 'video_' + uuid);
    this.el.querySelector('#video-screen').setAttribute('src', '#video_' + uuid);
  },
  update: function () {
    console.log('update', this.data);
    this.el.querySelector('#video-screen').setAttribute('position', this.data.video);
    this.el.querySelector('#controls').setAttribute('position', this.data.controls);

    // this.el.querySelector('.video-src').setAttribute('src', this.data.src);
    this.el.querySelector('.video-src').removeAttribute('src');
    this.el.querySelector('.video-src').innerHTML = `<source src="${this.data.src}"/>`;
  }

});

/**
 * TODO these should be refactored into separate components =>
 * environment-mood-component light on off depending on player play/pause
 *
 * @param scene
 * @param cursor
 * @param container
 */
function createDemoStuff (scene, cursor, container) {
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
  var videoPlayer = new AVideoPlayer(container, container.querySelector('.video-src'));

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
  /** container.querySelector('#control-play').addEventListener('click', function () {
    if (videoPlayer.paused) {
      scene.lightOn();
    } else {
      scene.lightOff();
      // hideCursor();
    }
  }); */

  $(container).on('play', () => scene.lightOn());
  $(container).on('pause', () => scene.lightOff());
}
