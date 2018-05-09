import $ from 'jquery';
import {AVideoPlayer} from './AVideoPlayer';
import {
  assetsTemplate, permissionTemplate, playerAndControlsTemplate,
  styleTemplate
} from './simple-video-player-templates';

import './video-player-environment';

import '../video-positional-audio';

import {getVectorRelativeToPlayer} from '../../utils/aframe-utils';
import {FPSCtrl} from '../../utils/fps-utils';

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
 *
 *  TODO  change visual controls when using autoplay
 *  TODO use video-positional-audio sound component
 *  NOTE: be careful when overloading meda-events .. play and pause are excluded from forwarding but there mmight be other intereferences when triggering others on container element (this.el)
 */

AFRAME.registerComponent('simple-video-player', {
  schema: {
    video: {type: 'vec3', default: '0 3 0'},
    controls: {type: 'vec3', default: '0 0.5 0.5'},
    src: {type: 'string'},
    'auto-play': {type: 'number', default: '10'},
    'auto-pause': {type: 'number', default: '10'}
  },
  init: function () {
    if (!initedOnce) {
      initStaticPortions(document.querySelector('a-scene'));
      initedOnce = true;
    }

    this.el.setAttribute('video-player-environment', true);

    var ctrls = $(playerAndControlsTemplate);

    $(this.el).append(ctrls);

    this.controlsEl = ctrls.next('#controls').get(0);
    this.videoEl = this.el.querySelector('#video-screen');

    var videoPlayer = new AVideoPlayer(this.el, this.el.querySelector('.video-src'));

    this.patchIDs();

    this.mPlayPauseInterval = new FPSCtrl(10, function () {
      var video = this.el.querySelector('.video-src');

      let distance = getVectorRelativeToPlayer(this.el).length();

      if (distance <= this.data['auto-play'] && video.paused) {
        this.el.dispatchEvent(new Event('play'));
      }
      if (distance > this.data['auto-pause'] && !video.paused) {
        this.el.dispatchEvent(new Event('pause'));
      }
    }, this)
      .start();
  },
  /**
     * simple way to circumvent a-video src ids
     */
  patchIDs: function () {
    // patch ids
    var uuid = THREE.Math.generateUUID();
    this.el.querySelector('.video-src').setAttribute('id', 'video_' + uuid);
    this.videoEl.setAttribute('src', '#video_' + uuid);
  },
  update: function () {
    this.videoEl.setAttribute('position', this.data.video);
    this.el.querySelector('#controls').setAttribute('position', this.data.controls);

    this.el.querySelector('.video-src').removeAttribute('src');
    this.el.querySelector('.video-src').innerHTML = `<source src="${this.data.src}"/>`;
  },
  tick: function () {
    var side = checkSide(this.el.object3D, this.el.sceneEl.camera.el.object3D);

    if (side == 'back') {
      this.controlsEl.getAttribute('position').z = -0.5;
      this.controlsEl.setAttribute('rotation', '0 180 0');
      this.videoEl.setAttribute('rotation', '0 180 0');
    } else {
      this.controlsEl.getAttribute('position').z = 0.5;
      this.controlsEl.setAttribute('rotation', '0 0 0');
      this.videoEl.setAttribute('rotation', '0 0 0');
    }
  },
  remove: function () {
    this.mPlayPauseInterval.stop();
  }

});

function checkSide (planeMesh, cameraObject) {
  let A = planeMesh;
  let B = cameraObject;

  let distance = new THREE.Plane((new THREE.Vector3(0, 0, 1)).applyQuaternion(A.quaternion)).distanceToPoint(B.getWorldPosition().sub(A.getWorldPosition()));
  return distance >= 0 ? 'front' : 'back';
}
