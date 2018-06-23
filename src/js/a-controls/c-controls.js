import * as _ from 'lodash';

AFRAME.registerComponent('c-controls', {

  schema: {
    enabled: {default: true},
    controls: {default: ['gamepad', 'trackpad', 'keyboard', 'touch']},
    speed: {default: 0.3, min: 0},
    fly: {default: false},
    constrainToNavMesh: {default: false},
    camera: {default: '[camera]', type: 'selector'}
  },

  init: function () {
    const el = this.el;

    /**
       * Note: what we learned so far
       * daydream controls does not work because ' el.sceneEl.systems['tracked-controls'].controllers' is empty event when navigator.getGamepads() contains the daydream gamepad
       * - forwarding that gamepad to theprevious array and reinitializing hte controls will enable partial functionality
       * - model still is not visible, so lets try to find out why the array is empty and how to change the fact
       *
       * FIXME awiting for aframe 8.3 to roll out and tesiting vr and controllers from there
       *
       */

    el.sceneEl.addEventListener('enter-vr', () => {
      setTimeout(() => {
        // this part ensures that the tracked-controls get initialized with a controller
        // it might be that other parts of aframe (daydream-controls injectTrackedControls | utils.isControllerPresent) are relying on this part already being executed and thus failing

        _.each(navigator.getGamepads(), (gamepad, i) => {
          console.log('gamepad', i, gamepad);
          if (gamepad == null) return;

          if (!gamepad.pose) { gamepad.pose = {}; }
          //  pose = controller.pose;
          // gamepad.pose = {position: [0, 0, -2], orientation: [0, 1, 0]};

          el.sceneEl.systems['tracked-controls'].controllers.push(gamepad);
        });

        // remove previous instances just to make sure things get initialized //TODO would be nice not to have to to this
        el.removeAttribute('laser-controls');
        el.removeAttribute('daydream-controls');

        el.setAttribute('laser-controls', 'hand: right');
        el.setAttribute('daydream-listener', {});
      }, 5000); // have a big timeout otherwise sometimes the controller is not yet ready
    });

    let isMobile = AFRAME.utils.isMobile();
    if (isMobile) {
      el.setAttribute('movement-controls', {});// TODO needs a rig see https://github.com/donmccurdy/aframe-extras/tree/master/src/controls
      el.setAttribute('look-controls', 'pointerLockEnabled:true');
    } else {
      el.setAttribute('customizable-wasd-controls', {});
      el.setAttribute('look-controls', 'pointerLockEnabled:false');
    }

    // alert('mobile:' + isMobile);
  }
});

AFRAME.registerComponent('daydream-listener', {
  init: function () {
    var el = this.el;
    this.el.addEventListener('trackpaddown', (e) => {
      console.log('daydream track down: ', e);
    });

    const loggy = (e) => {
      console.log('daydream:', e);
    };

    el.addEventListener('buttonchanged', loggy);
    el.addEventListener('buttondown', loggy);
    el.addEventListener('buttonup', loggy);
    el.addEventListener('touchstart', loggy);
    el.addEventListener('touchend', loggy);
    el.addEventListener('model-loaded', loggy);
    el.addEventListener('axismove', loggy);
  }
});
