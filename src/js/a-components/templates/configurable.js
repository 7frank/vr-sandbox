/**
 * add to be able to configure an entity when pressing <interaction-talk>
 *
 */
import {createHTML} from '../../utils/dom-utils';
import productConfigSample1 from '../a-configurator/productConfigSample1.html';

AFRAME.registerComponent('configurable', {
  schema: {
    type: 'array', default: 'product-configurator'
  },

  init: function () {
    // TODO data.parameters foreach gui-element

    this.mHandler1 = () => {
      if (!this.configMenu) {
        this.configMenu = createHTML(productConfigSample1);
        this.el.append(this.configMenu);
      } else {
        var vis = this.configMenu.getAttribute('visible');
        this.configMenu.setAttribute('visible', !vis);
      }
    };

    this.el.addEventListener('interaction-talk', this.mHandler1);
  },
  remove: function () {
    this.el.removeEventListener('interaction-talk', this.mHandler1);
    if (this.configMenu) {
      this.configMenu.parentElement.remove(this.configMenu);
    }
  }

});
