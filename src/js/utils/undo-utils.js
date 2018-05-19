import UndoManager from 'undo-manager';
import * as _ from 'lodash';

var undoManager = new UndoManager();

export var UndoMgr = {

  /**
     * Convenience function for adding an entity to another entity.
     * @param el
     * @param target
     */
  addHTMLElementToTarget: function (el, target) {
    var oldParentEL;

    function addElement () {
      oldParentEL = el.parentElement;
      target.appendChild(el);
    }

    undoManager.add({
      undo: function () {
        if (oldParentEL) {
          oldParentEL.appendChild(el);
        } else {
          target.removeChild(el);
        }
      },
      redo: addElement
    });

    addElement();
  },

  removeHTMLElement: function (el) {
    var oldParentEL;

    function removeElement () {
      oldParentEL = el.parentElement;
      el.parentElement.remove(el);
    }

    undoManager.add({
      undo: function () {
        if (oldParentEL) {
          oldParentEL.appendChild(el);
        }
      },
      redo: removeElement
    });

    removeElement();
  },
  addHTMLAttributes: function (el, attributes) {
    var oldAttributes = _.mapValues(attributes, (attr, key) => el.getAttribute(key));

    const addAttrs = (attributes) => () => _.each(attributes, (attr, key) => (attr != null) ? el.setAttribute(key, attr) : el.removeAttribute(key));

    this.add({
      redo: addAttrs(attributes),
      undo: addAttrs(oldAttributes)

    });

    addAttrs(attributes)();
  },
  add: function ({undo, redo}) {
    if (!undo) throw new Error('undo not defined');
    if (!redo) throw new Error('redo not defined');

    undoManager.add({undo, redo});
  },
  undo: () => undoManager.undo(),
  redo: () => undoManager.redo()

};
