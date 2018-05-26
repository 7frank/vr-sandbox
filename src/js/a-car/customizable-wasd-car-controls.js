import {enterVehicle, exitVehicle} from '../car.refactor';
import {EventListenerStateList} from '../utils/event-listener';
import {getWorldDistance, playSound, toast} from '../utils/aframe-utils';
import {getPlayer} from '../game-utils';

// var utils = AFRAME.utils;

// var bind = utils.bind;

/*
* inits controls based on the "keyboard-actions" plugin
*
**/

delete AFRAME.components['customizable-wasd-car-controls'];

AFRAME.registerComponent('customizable-wasd-car-controls', {
  schema: {},
  init: function () {
    // Bind methods and add event listeners.
    this.onBlur = this.onBlur.bind(this);// bind(this.onBlur, this);
    this.onFocus = this.onFocus.bind(this); // bind(this.onFocus, this);

    this.onVisibilityChange = this.onVisibilityChange.bind(this); // bind(this.onVisibilityChange, this);

    this.createListeners();

    // TODO
    // this.attachVisibilityEventListeners();

    // this.autowalkfixEvents.attachAll();

    this.mStateList.enableStates('enter-vehicle-events');
  },
  // update: function () {},
  // tick: function () {},
  remove: function () {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();

    // this.autowalkfixEvents.detachAll();
    this.mStateList.disableStates();
  },

  play: function () {
    if (this.mStateList.getActiveStates()['exit-vehicle-events']) {
      this.mStateList.enableStates('move-events');
    }
  },

  pause: function () {
    this.keys = {};
    if (this.mStateList.getActiveStates()['exit-vehicle-events']) {
      this.mStateList.disableStates('move-events');
    }
  },
  createListeners: function () {
    this.mStateList = new EventListenerStateList();
    this.mStateList.createState('visibility-events')
      .add(window, 'blur', this.onBlur)
      .add(window, 'focus', this.onFocus)
      .add(window, 'visibilitychange', this.onVisibilityChange);

    // -----------------------------
    let simpleCarComponentInstance = this.el.components['simple-car'];

    if (!simpleCarComponentInstance) {
      console.error("'customizable-wasd-car-controls' must be attribute of 'a-simple-car'");
      return;
    }

    // should be an instance of './car/tquery.car' {@see Car}
    var that = simpleCarComponentInstance._car;

    if (!that) {
      console.error("component 'simple-car' not compatible with 'a-simple-car'");
      return;
    }

    /**
         *
         * @param action - the internal action that should be triggered
         * @param bVal - a value indicating wheather the first or the second handler of an
         *                action should be handled. An action does have an optional value that is meant to work
         *                as undo for the first handler so if a click event is sent the action will trigger
         *                a down and up event for the action if 2 handlers where defined for it.
         * @returns {Function}
         */
    function keyHandler (action, bVal) {
      return function (event) {
        // TODO check the doc.activeel==doc.body part for potential conflict
        // if (!shouldCaptureKeyEvent(event)) { return; }

        var obj = that.controls();

        if (event.detail.first) {
          obj[action] = true;
        } else {
          obj[action] = false;
        }
      };
    }

    this.mStateList.createState('move-events')
      .add(window, 'player-move-forward', keyHandler('moveForward'))
      .add(window, 'player-move-backward', keyHandler('moveBackward'))
      .add(window, 'player-strafe-left', keyHandler('moveLeft'))
      .add(window, 'player-strafe-right', keyHandler('moveRight'));

    // --------------------------------

    this.mStateList.createState('enter-vehicle-events')
      .add(this.el, 'interaction-pick', this.enterVehicle.bind(this));

    this.mStateList.createState('exit-vehicle-events')
      .add(window, 'interaction-pick', this.exitVehicle.bind(this));
  },
  enterVehicle: function (event) {
    event.stopPropagation();

    this.mStateList.enableStates('exit-vehicle-events move-events').disableStates('enter-vehicle-events');

    var player = getPlayer();
    if (getWorldDistance(player.object3D, this.el.object3D) > 5) {
      toast('Get closer to a vehicle to enter it.', 'Got it.');
      playSound('.command-error');
    } else {
      enterVehicle(player, this.el);
    }
  },
  exitVehicle: function (event) {
    event.stopPropagation();
    this.mStateList.disableStates('exit-vehicle-events move-events').enableStates('enter-vehicle-events');
    var player = getPlayer();
    exitVehicle(player, this.el);
  },
  attachVisibilityEventListeners: function () {
    // this.visibilityEvents.attachAll();

    this.mStateList.enableStates('visibility-events');

    /* window.addEventListener('blur', this.onBlur);
                                      window.addEventListener('focus', this.onFocus);
                                      document.addEventListener('visibilitychange', this.onVisibilityChange);
                                      */
  },

  removeVisibilityEventListeners: function () {
    // this.visibilityEvents.detachAll();
    this.mStateList.enableStates('visibility-events');
    /* window.removeEventListener('blur', this.onBlur);
                                    window.removeEventListener('focus', this.onFocus);
                                    document.removeEventListener('visibilitychange', this.onVisibilityChange);
                                    */
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
