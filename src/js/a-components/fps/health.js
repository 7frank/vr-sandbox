import {getPlayer} from '../../game-utils';
import {playSound, toast} from '../../utils/aframe-utils';
import {createHTML} from '../../utils/dom-utils';
import * as _ from 'lodash';
import { broadcastPlayerHealthChange} from '../../network-game-logic';

AFRAME.registerComponent('health', {
  schema: {
    hpMax: {default: 100},
    hp: {default: 70},
    armor: {default: 50},
    shield: {default: 50} // spacebar
  },

  init: function () {

  },
  loseHealth: function (deltaHealth = 1) {
    this.data.hp -= deltaHealth;

    if (this.data.hp <= 0) {
      this.data.hp = 0;

      this.el.emit('health-zero');
    }

    this.el.emit('health-change', {current: this.data.hp, max: this.data.hpMax});
  }
});

AFRAME.registerComponent('health-bar', {
  dependencies: ['health'],
  schema: {},

  init: function () {
    let healthComponent = this.el.components.health;

    let hp = _.round(healthComponent.data.hp / healthComponent.data.hpMax, 3);
    this.outer = createHTML(`<a-plane material="color:white;opacity:0.3" gui-border height="0.1" width="1"  ></a-plane>`);
    this.inner = createHTML(`<a-plane material="color:green;opacity:0.3" height="0.1" width="${hp}"  position="0 0 .01"></a-plane>`);

    this.el.append(this.outer);
    this.el.append(this.inner);

    this.el.addEventListener('health-change', ({detail}) => {
      let hp = _.round(detail.current / detail.max, 3);
      console.log('health-change', detail, detail.current, detail.max, hp);

      // ------------------------
      const NAF = window.NAF;

      let networkedEl = this.el.closest('[networked]');
      let clientID = NAF.utils.getNetworkId(networkedEl);

      broadcastPlayerHealthChange(clientID, healthComponent.data.hp);

      // ------------------------

      this.inner.setAttribute('width', hp);
    });

    /**
       * respawn
       * - reset health
       * - set scoreboard
       * TODO put in separate component
       * TODO respawn is only local .. use network
       */
    this.el.addEventListener('health-zero', ({detail}) => {
      console.log('health-zero', detail);
      toast('u ended other guy');

      healthComponent.data.hp = healthComponent.data.hpMax;
      this.inner.setAttribute('width', 1);
    });
  }
});
