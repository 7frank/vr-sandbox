import {shouldCaptureKeyEvent} from '../utils/dom-utils';

var KEYCODE_TO_CODE = {
  '38': 'ArrowUp',
  '37': 'ArrowLeft',
  '40': 'ArrowDown',
  '39': 'ArrowRight',
  '87': 'KeyW',
  '65': 'KeyA',
  '83': 'KeyS',
  '68': 'KeyD'
};

var utils = AFRAME.utils;

var bind = utils.bind;

var CLAMP_VELOCITY = 0.00001;
var MAX_DELTA = 0.2;
var KEYS = [
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'
];

/**
 *
 * port of the original A-Frame WASD component to control entities using WASD keys.
 *
 * The goal of the port is to use the keyboard-interactions library to bind and listen to the actions
 * move-forward move-backward strafe-left strafe-right rotate-left and rotate-right
 *
 *
 * Next up:
 * FIXME having human input as backend does not fully work currently
 * - test customising wasd
 * - have event mappings for undo/release
 * - keymap dialog does not show up if the scene has the focus when using "HumanInput"
 * - dialog needs some testing if all elements still are rendered correctly
 * - make a kinematic compatible version for physics to work
 *
 *
 */
module.exports.Component = AFRAME.registerComponent('customizable-wasd-controls', {
  schema: {
    acceleration: {default: 65},
    adAxis: {default: 'x', oneOf: ['x', 'y', 'z']},
    adEnabled: {default: true},
    adInverted: {default: false},
    easing: {default: 20},
    enabled: {default: true},
    fly: {default: false},
    wsAxis: {default: 'z', oneOf: ['x', 'y', 'z']},
    wsEnabled: {default: true},
    wsInverted: {default: false}
  },

  init: function () {
    // To keep track of the pressed keys.
    this.keys = {};

    this.position = {};
    this.velocity = new THREE.Vector3();

    // Bind methods and add event listeners.
    this.onBlur = bind(this.onBlur, this);
    this.onFocus = bind(this.onFocus, this);
    // this.onKeyDown = bind(this.onKeyDown, this);
    // this.onKeyUp = bind(this.onKeyUp, this);
    this.onVisibilityChange = bind(this.onVisibilityChange, this);
    this.attachVisibilityEventListeners();
  },

  tick: function (time, delta) {
    var currentPosition;
    var data = this.data;
    var el = this.el;
    var movementVector;
    // depending on weather the element has a physics body we choose a position object
    // TODO the question to answer here would be "do we want an element with physics to be able to move without a proper ground"
    var position = this.el.body ? this.el.body.position : this.position;
    var velocity = this.velocity;

    if (!velocity[data.adAxis] && !velocity[data.wsAxis] &&
            isEmptyObject(this.keys)) {
      return;
    }

    // Update velocity.
    delta = delta / 1000;
    this.updateVelocity(delta);

    if (!velocity[data.adAxis] && !velocity[data.wsAxis]) {
      return;
    }

    // Get movement vector and translate position.
    currentPosition = el.getAttribute('position');
    movementVector = this.getMovementVector(delta);
    position.x = currentPosition.x + movementVector.x;
    position.y = currentPosition.y + movementVector.y;
    position.z = currentPosition.z + movementVector.z;
    el.setAttribute('position', position);
  },

  remove: function () {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
  },

  play: function () {
    this.attachKeyEventListeners();
  },

  pause: function () {
    this.keys = {};
    this.removeKeyEventListeners();
  },

  updateVelocity: function (delta) {
    var acceleration;
    var adAxis;
    var adSign;
    var data = this.data;
    var keys = this.keys;
    var velocity = this.velocity;
    var wsAxis;
    var wsSign;

    adAxis = data.adAxis;
    wsAxis = data.wsAxis;

    // If FPS too low, reset velocity.
    if (delta > MAX_DELTA) {
      velocity[adAxis] = 0;
      velocity[wsAxis] = 0;
      return;
    }

    // Decay velocity.
    if (velocity[adAxis] !== 0) {
      velocity[adAxis] -= velocity[adAxis] * data.easing * delta;
    }
    if (velocity[wsAxis] !== 0) {
      velocity[wsAxis] -= velocity[wsAxis] * data.easing * delta;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[adAxis]) < CLAMP_VELOCITY) {
      velocity[adAxis] = 0;
    }
    if (Math.abs(velocity[wsAxis]) < CLAMP_VELOCITY) {
      velocity[wsAxis] = 0;
    }

    if (!data.enabled) {
      return;
    }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;
    if (data.adEnabled) {
      adSign = data.adInverted ? -1 : 1;
      if (keys.KeyA || keys.ArrowLeft) {
        velocity[adAxis] -= adSign * acceleration * delta;
      }
      if (keys.KeyD || keys.ArrowRight) {
        velocity[adAxis] += adSign * acceleration * delta;
      }
    }
    if (data.wsEnabled) {
      wsSign = data.wsInverted ? -1 : 1;
      if (keys.KeyW || keys.ArrowUp) {
        velocity[wsAxis] -= wsSign * acceleration * delta;
      }
      if (keys.KeyS || keys.ArrowDown) {
        velocity[wsAxis] += wsSign * acceleration * delta;
      }
    }
  },

  getMovementVector: (function () {
    var directionVector = new THREE.Vector3(0, 0, 0);
    var rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    return function (delta) {
      var rotation = this.el.getAttribute('rotation');
      var velocity = this.velocity;
      var xRotation;

      directionVector.copy(velocity);
      directionVector.multiplyScalar(delta);

      // Absolute.
      if (!rotation) {
        return directionVector;
      }

      xRotation = this.data.fly ? rotation.x : 0;

      // Transform direction relative to heading.
      rotationEuler.set(THREE.Math.degToRad(xRotation), THREE.Math.degToRad(rotation.y), 0);
      directionVector.applyEuler(rotationEuler);
      return directionVector;
    };
  })(),

  attachVisibilityEventListeners: function () {
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },

  removeVisibilityEventListeners: function () {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  attachKeyEventListeners: function () {
    //  window.addEventListener('keydown', this.onKeyDown);
    // window.addEventListener('keyup', this.onKeyUp);
    var that = this;

    /**
         *
         * @param code - the key code in the internal notation
         * @param bVal - a value indicating wheather the first or the second handler of an
         *                action should be handled. An action does have an optional value that is meant to work
         *                as undo for the first handler so if a click event is sent the action will trigger
         *                a down and up event for the action if 2 handlers where defined for it.
         * @returns {Function}
         */
    function keyHandler (code, bVal) {
      return function (event) {
      // TODO check if event target is child* of a-scene
        if (!shouldCaptureKeyEvent(that.el, event)) {
          return;
        }

        if (KEYS.indexOf(code) !== -1) {
          if (event.detail.first) {
            that.keys[code] = true;
          } else {
            delete that.keys[code];
          }
        }
      };
    }

    this.khw = keyHandler('KeyW');
    this.khs = keyHandler('KeyS');
    this.kha = keyHandler('KeyA');
    this.khd = keyHandler('KeyD');

    window.addEventListener('player-move-forward', this.khw);
    window.addEventListener('player-move-backward', this.khs);
    window.addEventListener('player-strafe-left', this.kha);
    window.addEventListener('player-strafe-right', this.khd);
  },

  removeKeyEventListeners: function () {
    //  window.removeEventListener('keydown', this.onKeyDown);
    // window.removeEventListener('keyup', this.onKeyUp);

    window.removeEventListener('player-move-forward', this.khw);
    window.removeEventListener('player-move-backward', this.khs);
    window.removeEventListener('player-strafe-left', this.kha);
    window.removeEventListener('player-strafe-right', this.khd);
  },

  onBlur: function () {
    this.pause();
  },

  onFocus: function () {
    this.play();
  },

  onVisibilityChange: function () {
    if (document.hidden) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  }

});

function isEmptyObject (keys) {
  var key;
  for (key in keys) {
    return false;
  }
  return true;
}
