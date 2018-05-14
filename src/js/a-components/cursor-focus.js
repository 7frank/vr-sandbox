/**
 * will add additional handlers to be able to send keyboard events to target
 * @param target
 */
import {onElementChange} from '../utils/listener-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';

/**
 * fixes  keyboard support for non-control elements
 * @param target
 */
function fixFocusAndOtherThingsForNow (target) {
  if (target.__hasFocusFixed) return;

  if (target.hasAttribute && !target.hasAttribute('tabIndex')) {
    target.setAttribute('tabIndex', '-1');
  }

  // TODO handle cases where this is not wanted
  target.addEventListener('mouseenter', () => target.focus());
  target.addEventListener('mouseleave', () => target.blur());

  target.__hasFocusFixed = true;
}

/**
 * A helper component that sets focus to the element under the cursor component.
 * This is necessary for keyboard events and hotkeys to be forwarded to the correct element
 *
 */

updateHotComponent('cursor-focus');
AFRAME.registerComponent('cursor-focus', {
  schema: {},
  init: function () {
    var initCursor = () => {
      this.mCursor = document.querySelector('[cursor]');
      if (this.mCursor) { this.updateCursorHandlers(); }
    };

    initCursor();

    onElementChange(undefined, '[cursor]', initCursor);

    // https://github.com/aframevr/aframe/blob/master/docs/components/cursor.md
    // see states "cursor-hovering"	and "cursor-hovered"

    /*

          // ---------------------------------

          // TODO find or create  change event if another element is intersected in which case the focus will be set to that one
          var cursor = document.querySelector('[cursor]');

          cursor.addEventListener('change');

          // ---------------------------------

          document.querySelector('[cursor-hovered]');

          // ---------------------------------

          var intersects = document.querySelector('[cursor]').components['cursor'].intersectedEl;
          var id = appendImageToDOM(url).id;

          console.log('intersects', intersects);
          console.log('id', id);

          intersects.setAttribute('material', {src: '#' + id});

          // ---------------------------------

          fixFocusAndOtherThingsForNow(intersects.el);
          intersects.el.focus;

         */
  },
  updateCursorHandlers: function () {
    console.log('updateCursorHandlers');
    var that = this;

    this.mCursor.addEventListener('mouseenter', function (evt) {
      var targetEl = evt.detail.intersectedEl;
      fixFocusAndOtherThingsForNow(targetEl);
    });

    this.mCursor.addEventListener('mouseleave', function (evt) {
      var targetEl = evt.detail.intersectedEl;
    });
  },

  remove: function () {

  }

})
;
