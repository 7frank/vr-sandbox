/**
 * pick up items and carry them in front of the player
 *
 */
import {getPlayer, getPositionInFrontOfEntity} from '../../game-utils';
import {_setPosition} from '../../utils/aframe-utils';
import {UndoMgr} from '../../utils/undo-utils';

AFRAME.registerComponent('pickable', {
  schema: {},

  init: function () {
    // TODO data.parameters foreach gui-element
    this.isPickedUp = false;

    var oldPosition;

    this.mHandler1 = (e) => {
      e.stopPropagation();

      this.isPickedUp = !this.isPickedUp;

      // store position previous to picking
      if (this.isPickedUp) {
        oldPosition = this.el.object3D.position.clone();
      } else {
        let newPosition = this.el.object3D.position.clone();

        UndoMgr.add({
          redo: ((position) => () => { console.log(position); _setPosition(this.el, position); })(newPosition.clone()),
          undo: ((position) => () => { console.log(position); _setPosition(this.el, position); })(oldPosition.clone())
        });
      }
    };

    this.el.addEventListener('interaction-pick', this.mHandler1);
  },
  tick: function () {
    if (this.isPickedUp) {
      // TODO use undo manager
      let position = getPositionInFrontOfEntity(this.el, getPlayer(), 4, false);
      _setPosition(this.el, position);
    }
  },
  remove: function () {
    this.el.removeEventListener('interaction-pick', this.mHandler1);
  }

});
