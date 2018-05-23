
import {HTMLElementStates} from './HTMLElementStates';

/**
 * with this class we should be able to switch between player-move and model-edit state
 * TODO use enums probably
 */

export
class PlayerStates extends HTMLElementStates {
  constructor (el) {
    super(el);

    this.registerPlayerStates();

    this.setState('move');
  }

  // TODO have the option to disable enable hotkey categories this way
  registerPlayerStates () {
    this.addState('move', {
      'mouse-controls': {enabled: true, pointerlockEnabled: true},
      'customizable-wasd-controls': true
      // 'universal-controls': 'rotationSensitivity:0.2'
    });

    this.addState('edit-model', {
      'mouse-controls': {enabled: true, pointerlockEnabled: false},
      'transform-controls': true

    });
  }
}
