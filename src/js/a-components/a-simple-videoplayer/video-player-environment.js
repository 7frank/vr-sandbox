import $ from 'jquery';

/**
 *
 *
 *
 *
 */

AFRAME.registerComponent('video-player-environment', {
  dependencies: ['simple-video-player'],
  init: function () {
    var scene = this.el.sceneEl;

    scene.setAttribute('fog', 'type: linear; near:12; far:20; color: #dbdedb;'); // Night mode: #0c192a

    /**
     * CINEMA MODE
     * TODO might not work due to animation component missing
     * TODO also maybe have this as an optional component that depends on playercomponent so not every player darkens the environment
     */

    scene.lightOff = function () {
      console.log('lightOff');

      scene.removeAttribute('animation__fogback');
      scene.setAttribute('animation__fog', 'property: fog.color; to: #0c192a; dur: 800; easing: easeInQuad;');
    };
    scene.lightOn = function () {
      console.log('lightOn');

      scene.removeAttribute('animation__fog');
      scene.setAttribute('animation__fogback', 'property: fog.color; to: #dbdedb; dur: 800');
    };

    $(this.el).on('play', () => scene.lightOn());
    $(this.el).on('pause', () => scene.lightOff());
  }
});
