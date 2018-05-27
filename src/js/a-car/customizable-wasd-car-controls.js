import {enterVehicle, exitVehicle} from '../car.refactor';
import {EventListenerStateList} from '../utils/event-listener';
import {getWorldDistance, playSound, toast} from '../utils/aframe-utils';
import {getPlayer} from '../game-utils';

/**
* Init controls based on the "keyboard-actions" plugin
*/

delete AFRAME.components['customizable-wasd-car-controls'];

AFRAME.registerComponent('customizable-wasd-car-controls', {
  dependencies: ['simple-car'],
  schema: {},
  init: function () {
    this.createListeners();

    this.mStateList.enableStates('enter-vehicle-events visibility-events');
  },
  remove: function () {
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
  getCarInstance: function () {
    return this.el.components['simple-car']._car;
  },
  createListeners: function () {
    this.mStateList = new EventListenerStateList();
    this.mStateList.createState('visibility-events')
      .add(window, 'blur', this.onBlur.bind(this))
      .add(window, 'focus', this.onFocus.bind(this))
      .add(window, 'visibilitychange', this.onVisibilityChange.bind(this));

    // -----------------------------

    var that = this.getCarInstance();

    if (!that) {
      console.error("car instance not found (you need to attach car-controls via setAttribute to 'a-simple-car')");
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

    this.getCarInstance().resetControls();// stop the car inputs
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
