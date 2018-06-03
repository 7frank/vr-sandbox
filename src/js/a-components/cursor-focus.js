/**
 * will add additional handlers to be able to send keyboard events to target
 * @param target
 */
import {onElementChange} from '../utils/listener-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';

/**
 * Fixes  keyboard support for non-control elements.
 * Note: very el that the mouse hovers will have this applied once. This way actions can be bound directly to the el instead of using the Hotkeys notation.
 * TODO this action handling might change in a future version
 * @param target
 */
function fixFocusable (target) {
  if (target.__hasFocusFixed) return;

  if (target.hasAttribute && !target.hasAttribute('tabIndex')) {
    target.setAttribute('tabIndex', '-1');
  }

  target.__hasFocusFixed = true;
}

/**
 * A helper component that sets focus to the element under the cursor component.
 * This is necessary for keyboard events and hotkeys to be forwarded to the correct element.
 *
 */

updateHotComponent('cursor-focus');
AFRAME.registerComponent('cursor-focus', {
  schema: {},
  init: function () {
    // keep track of the cursor component
    var initCursor = () => {
      this.mCursor = document.querySelector('[cursor]');
      if (this.mCursor) { this.updateCursorHandlers(); }
    };

    initCursor();
    onElementChange(undefined, '[cursor]', initCursor);
  },
  updateCursorHandlers: function () {
    var that = this;

    this.mCursor.addEventListener('mouseenter', function (evt) {
      var targetEl = evt.detail.intersectedEl;
      // console.log('cursor-focus mouseenter', evt.detail);
      fixFocusable(targetEl);
      targetEl.focus();
      that.el.emit('change', targetEl);
    });

    this.mCursor.addEventListener('mouseleave', function (evt) {
      var targetEl = evt.detail.intersectedEl;
      targetEl.blur();
    });
  },

  remove: function () {

  }

})
;
