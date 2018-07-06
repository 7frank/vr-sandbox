import {getPlayer, getPlayers} from '../../game-utils';
import {getWorldPosition, playSound, toast} from '../../utils/aframe-utils';
import {createHTML} from '../../utils/dom-utils';
import * as _ from 'lodash';

AFRAME.registerComponent('bullet', {
  schema: {
    bulletTemplate: {default: '#bullet-template'},
    speed: {default: 20} // m/s
  },

  init: function () {
    let el = this.el;

    el.setAttribute('networked', 'template:' + this.data.bulletTemplate);
    el.setAttribute('remove-in-seconds', 3);
    el.setAttribute('forward', 'speed:' + this.data.speed);
    el.setAttribute('static-body', {}); // TODO can't shoot players if static body is enabled as static bodies don't emit collision
    // beginContact endContact
    playSound('.pew-pew');

    el.addEventListener('collide', (e) => {
      var targetEl = e.detail.body.el;

      playSound('.bullet-impact');
      console.log('bullet collide with', targetEl);
      // collide with player
      /*          if ($(targetEl).hasClass(that.data.playerClass)) {
                                console.log('simple-ball.collide player', e);
                            }
                    */

      // in any case: if the bullet collides delete it
      // this.el.parentElement.removeChild(this.el);
    });
  },
  tick: function () {
    let players = getPlayers();
    let myself = getPlayer();
    players = _.reject(players, o => o == myself);

    let bulletPosition = getWorldPosition(this.el.object3D);

    let myRadius = myself.body.boundingRadius;

    players.forEach(playerEl => {
      let playerPosition = getWorldPosition(playerEl.object3D);
      if (playerPosition.sub(bulletPosition).length() <= myRadius) {
        let hh = playerEl.querySelector('[health]').components.health;

        hh.loseHealth(2);
      }
    });
  }

});
