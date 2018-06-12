/**
 * will add additional handlers to be able to send keyboard events to target
 * @param target
 */
import {onElementChange} from '../utils/listener-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';
import {getCursor} from '../game-utils';

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
      this.mCursor = getCursor();
      if (this.mCursor) { this.updateCursorHandlers(); }
    };

    initCursor();
    onElementChange(undefined, '[cursor]', initCursor);
    onElementChange(undefined, '[mouse-cursor]', () => {
      initCursor();

      let mc = this.mCursor.components['mouse-cursor'];
      mc._setIntersectObject = function _setIntersectObject (el) {
        console.log('_setIntersectObject', el);
        this._intersectedEl = el;
        if (this._isMobile) { return; }
        el.addState('hovered'); this._emit('mouseenter');
        el.emit('mouseenter');
        this.el.addState('hovering');
      };

      mc._clearIntersectObject = function _clearIntersectObject () {
        const { _intersectedEl: el } = this;
        if (el && !this._isMobile) {
          el.removeState('hovered'); this._emit('mouseleave');
          el.emit('mouseleave');
          this.el.removeState('hovering');
        }

        this._intersectedEl = null;
      };

      this.el.sceneEl.addEventListener('renderstart', () => mc._attachEventListeners());
    });
  },
  updateCursorHandlers: function () {
    var that = this;

    // cursor and mouse-cursor
    function T_T (evt) {
      return evt.detail.intersectedEl || evt.detail.target;
    }

    // -----------------------------
    // TODO currently click handler is there for the HUD and main menu
    this.mCursor.addEventListener('click', function (evt) {
      var targetEl = T_T(evt);
      console.log('cursor-focus click', evt.detail);
      if (targetEl == document.activeElement) return;
      fixFocusable(targetEl);
      targetEl.focus();
      that.el.emit('focus-change', targetEl);
    });

    // -----------------------------

    this.mCursor.addEventListener('mouseenter', function (evt) {
      var targetEl = T_T(evt);
      console.log('cursor-focus mouseenter', evt.detail);
      fixFocusable(targetEl);
      targetEl.focus();
      that.el.emit('focus-change', targetEl);
    });

    this.mCursor.addEventListener('mouseleave', function (evt) {
      var targetEl = T_T(evt);
      console.log('cursor-focus mouseleave', evt.detail);

      targetEl.blur();
    });
  },

  remove: function () {

  }

})
;
