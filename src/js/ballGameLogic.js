
import $ from 'jquery';
import {playSound, setPosition, toast} from './utils/aframe-utils';
import CANNON from 'cannon';
import {getBall} from './game-utils';

// TODO make it work with dynamic loadable regions

export
function attachGameLogic () {
  $('.player').on('collide', function (e) {
    var targetEl = e.detail.body.el;

    // FIXME

    if ($(targetEl).hasClass('ball')) {
      //  targetEl.body.applyImpulse(
      //  e.detail.contact.ni.negate().scale(5),  //impulse
      new CANNON.Vec3().copy(targetEl.object3D.position);//   world position
      //   );
    }
  });

  // everything that falls down to limbo gets spawned at the center of the playing field
  $('.limbo').on('collide', function (e) {
    var targetEl = e.detail.body.el;
    setPosition(targetEl, '0 10 0');
  });

  $('.ball').on('collide', function (e) {
    var targetEl = e.detail.body.el;

    if ($(targetEl).hasClass('goal')) {
      toast('GOAL!!!!');
      playSound('.sound-cheer', 3000);

      $('.goal-info-text').fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300);
      setPosition($('.ball').get(0), '0 15 0');
      // FIXME not working for .player
      // TODO also might not always be working if player is following vehicle
      // setPosition($('.player').get(0), '-5 1 0');
      $('.player').attr('position', '0 1 0');
    }
  });

  // var ballEl = document.querySelector('a-sphere');
  // console.log('sphere' + ballEl);
  // ballEl.addEventListener(
  $('.ball').on('collide', function (e) {
    var targetEl = e.detail.body.el;

    playSound('.sound-ball-bounce');

    console.log('ball has collided with body', targetEl.tagName, targetEl.getAttribute('class'));

    if (!$(targetEl).hasClass('floor') && !targetEl.hasAttribute('editable-region')) {
      if (!targetEl.__origColor__) targetEl.__origColor__ = targetEl.getAttribute('color');

      targetEl.setAttribute('color', 'red');

      setTimeout(function () {
        targetEl.setAttribute('color', targetEl.__origColor__);
      }, 500);
    }

    e.detail.target.el.setAttribute('position', {y: 20});
    e.detail.target.el.flushToDOM();

    //  e.detail.target.el; // Original entity (playerEl).
    //  e.detail.body.el; // Other entity, which playerEl touched.
    //  e.detail.contact; // Stats about the collision (CANNON.ContactEquation).
    //  e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
  });

  $('.ball').on('interaction-pick', function (e) {
    // FIXME not calling stopPropagation will result in n+1 handlers being called everytime the action is triggered
    e.stopPropagation();
    toast('TODO add [pickable] to ball');
  });

  // Hotkeys(getBall()).on('interaction-pick', () => { alert('TODO pickable'); }); // enterOrExitVehicle);

  // wait for some mseconds after the last collision to revert to the original color
  /*  playerEl.addEventListener('collide', debounce(function (e) {
                                  // console.log('no more collision');
                                  var targetEl = e.detail.body.el;
                                  if (targetEl.__origColor__) { targetEl.setAttribute('color', targetEl.__origColor__); }
                                }, 200)); */
}
