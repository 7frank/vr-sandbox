// TODO hotkeys action remove-entity bind to mouse-right
// TODO adaptive position of closeEl based on size of el
//  how would an implementation of that work
import * as _ from 'lodash';
import {createHTML} from '../../utils/dom-utils';

import {toast} from '../../utils/aframe-utils';

import {UndoMgr} from '../../utils/undo-utils';

AFRAME.registerComponent('template-removable', {
  schema: {},

  init: function () {
    this.closeEl = createHTML(`<a-entity simple-billboard position="0 1.5 0"><a-circle  material="side: double; color: red; transparent: true; opacity: 0.7"  radius=".1"></a-circle><a-text position="-.0775 .025 0" value="x"></a-text></a-entity>`);
    this.el.append(this.closeEl);

    this.closeEl.addEventListener('click', this.onRemoveEvent.bind(this));

    var debounceHide = _.debounce(() => this.closeEl.setAttribute('visible', false), 2000);

    this.el.addEventListener('focus', () => {
      debounceHide.cancel();
      this.closeEl.setAttribute('material', 'opacity:0.9');
      this.closeEl.setAttribute('visible', true);
    });
    this.el.addEventListener('blur', () => this.closeEl.setAttribute('material', 'opacity:0.3'));
    this.el.addEventListener('blur', debounceHide);
  },
  remove: function () {
    this.closeEl.removeEventListener('click', this.onRemoveEvent.bind(this));
  },
  onRemoveEvent: function (event) {
    event.stopPropagation();

    // console.log('template-removable', arguments, this.data, event.detail.intersection);
    toast('removed entity');

    UndoMgr.removeHTMLElement(this.el);
  }

});
