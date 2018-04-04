import UndoManager from 'undo-manager';

var undoManager = new UndoManager();

export var UndoMgr = {

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
  undo: () => undoManager.undo(),
  redo: () => undoManager.redo()

};
