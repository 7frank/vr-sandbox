import UndoManager from 'undo-manager';
import * as _ from 'lodash';

var undoManagerMap = {};

export var UndoMgr = getUndoManager('default');

/**
 *
 * @param name
 * @returns {*}
 */

export function getUndoManager (name) {
  console.log(undoManagerMap);
  if (undoManagerMap[name]) return undoManagerMap[name];

  var undoManager = new UndoManager();

  var mUndoMgr = {

    /**
         * Convenience function for adding an entity to another entity.
         * @param el
         * @param target
         */
    addHTMLElementToTarget: function (el, target, position) {
      var oldParentEL;

      if (!position) position = el.getAttribute('position');
      else if (typeof position !== 'string') { position = AFRAME.utils.coordinates.stringify(position); }

      function addElement () {
        oldParentEL = el.parentElement;
        target.appendChild(el);
        el.setAttribute('position', position);
      }

      this.add({
        undo: function () {
          if (oldParentEL) {
            oldParentEL.appendChild(el);
          } else {
            target.removeChild(el);
          }
        },
        redo: addElement
      });

      // addElement();
    },

    removeHTMLElement: function (el) {
      var oldParentEL;

      function removeElement () {
        oldParentEL = el.parentElement;
        el.parentElement.remove(el);
      }

      this.add({
        undo: function () {
          if (oldParentEL) {
            oldParentEL.appendChild(el);
          }
        },
        redo: removeElement
      });

      // removeElement();
    },
    /**
         * Puts attribute changes of a HTMLElement onto the undo stack.
         * @param {HTMLElement} el - The target for the undo/redo.
         * @param {object} attributes - A map containing attributes that should be changed via setAttribute.
         * @param {object} [oldAttributes] - A map containing attributes that will be used for the undo step. Note: If left undefined, 'oldAttributes' will be retrieved from the 'attributes' keys.
         */
    addHTMLAttributes: function (el, attributes, oldAttributes) {
      if (!oldAttributes) {
        oldAttributes = _.mapValues(attributes, (attr, key) => el.getAttribute(key));
      }

      const addAttrs = (attributes) => () => _.each(attributes, (attr, key) => (attr != null) ? el.setAttribute(key, attr) : el.removeAttribute(key));
      this.add({
        redo: addAttrs(attributes),
        undo: addAttrs(oldAttributes)

      });

      // addAttrs(attributes)();
    },
    add: function ({undo, redo}) {
      if (!undo) throw new Error('undo not defined');
      if (!redo) throw new Error('redo not defined');

      undoManager.add({undo, redo});

      // call the method once
      redo();
    },
    undo: () => undoManager.undo(),
    redo: () => undoManager.redo()

  };

  undoManagerMap[name] = mUndoMgr;

  return mUndoMgr;
}
