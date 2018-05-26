/**
 * TODO getStatesConfig setStatesConfig previous config //better work flow for disable and undo of disabling
 * TODO have factories for certain recurring things
 * - vehicularBehaviour
 * - playerBehaviour
 * this way being able to bind events to a certain entity
 */

import _ from 'lodash';
import {Logger} from '../utils/Logger';

var console = Logger.getLogger('event-listener');

export class EventListenerStateList {
  constructor () {
    this.mStates = {};
  }

  createState (stateName) {
    if (this.mStates[stateName]) throw new Error('state name already defined');

    return this.mStates[stateName] = new EventListenerList();
  }

  getActiveStates () {
    return _(this.mStates).pickBy(state => state.active()).mapValues(state => state.mList.map(entry => entry.name).join(' ')).value();
  }

  /**
     * String containing state names separated by one <space>
     * @param [states] - leave empty to enable all registered
     */
  enableStates (statesString) {
    if (!statesString) Object.keys(this.mStates).join(' ');

    let states = statesString.split(/\s+/);

    console.log('enableStates', states);

    _.each(states, state => this.mStates[state] ? this.mStates[state].attachAll() : console.warn(`state ${state} not defined`));

    return this;
  }
  /**
     * String containing state names separated by one <space>
     * @param [states] - leave empty to disable all registered
     */
  disableStates (statesString) {
    if (!statesString) Object.keys(this.mStates).join(' ');

    let states = statesString.split(/\s+/);
    console.log('disableStates', states);
    _.each(states, state => this.mStates[state] ? this.mStates[state].detachAll() : console.warn(`state ${state} not defined`));
    return this;
  }
}

export class EventListenerList {
  constructor () {
    this.mList = [];
    this.attached = false;
  }
  active () { return this.attached; }
  add (target, name, handler) {
    if (!name) console.error('EventListenerList missing name');
    if (!handler) console.error('EventListenerList missing handler for: ', name);

    this.mList.push({target, name, handler});
    return this;
  }

  attachAll () {
    if (this.attached) {
      console.warn('EventListenerList already attached all events');
      return this;
    }
    console.log('attachAll', this.mList);
    this.mList.forEach(({target, name, handler}) => target.addEventListener(name, handler));
    this.attached = true;
    return this;
  }

  detachAll () {
    if (!this.attached) {
      console.warn('EventListenerList already detached all events');
      return this;
    }
    console.log('detachAll', this.mList);
    this.mList.forEach(({target, name, handler}) => target.removeEventListener(name, handler));
    this.attached = false;
    return this;
  }
}
