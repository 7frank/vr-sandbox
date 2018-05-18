import $ from 'jquery';
import {playSound, setPosition, toast} from '../utils/aframe-utils';
import CANNON from 'cannon';
import {getPlayer} from '../game-utils';

// TODO make it work with dynamic loadable regions by cerating a component "simple-ball" with collision logic for

AFRAME.registerComponent('simple-ball', {
  schema: {
    respawn: {
      type: 'vec3', default: {x: 0, y: 0, z: 0}
    },
    playerClass: {
      type: 'string', default: 'player'
    },
    goalClass: {
      type: 'string', default: 'goal'
    }
  },

  tick: function () {
  },
  init: function () {
    var that = this;

    this.el.addEventListener('collide', function (e) {
      var targetEl = e.detail.body.el;

      playSound('.sound-ball-bounce');

      // collide with player
      if ($(targetEl).hasClass(that.data.playerClass)) {
        console.log('simple-ball.collide player', e);
      }

      // collide with goal
      if ($(targetEl).hasClass(that.data.goalClass)) {
        toast('GOAL!!!!');
        playSound('.sound-cheer', 3000);

        $('.goal-info-text').fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300);
        setPosition(that.el, '0 15 0');
        // FIXME not working for .player
        // TODO also might not always be working if player is following vehicle
        // setPosition($('.player').get(0), '-5 1 0');
        $(getPlayer()).attr('position', '0 1 0');
      }

      // floor
      if (!$(targetEl).hasClass('floor') && !targetEl.hasAttribute('editable-region')) {
        if (!targetEl.__origColor__) targetEl.__origColor__ = targetEl.getAttribute('color');

        targetEl.setAttribute('color', 'red');

        setTimeout(function () {
          targetEl.setAttribute('color', targetEl.__origColor__);
        }, 500);
      }
    });

    this.el.addEventListener('interaction-pick', function (e) {
      // FIXME not calling stopPropagation will result in n+1 handlers being called everytime the action is triggered
      e.stopPropagation();
      toast('TODO add [pickable] to ball');
    });
  }

});
