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
    this.mStates[stateName] = new EventListenerList();
    return this.mStates[stateName];
  }

  getActiveStates () {
    return _(this.mStates).pickBy(state => state.active()).mapValues(state => state.mList.map(entry => entry.name).join(' ')).value();
  }

  isActiveState (name) {
    return this.mStates[name] && this.mStates[name].active();
  }

  /**
     * String containing state names separated by one <space>
     * @param [states] - leave empty to enable all registered
     */
  enableStates (...args) {
    let states;

    if (args.length == 0) { states = Object.keys(this.mStates); } else if (args.length == 1) { states = args[0].split(/\s+/); }
    if (args.length > 1) { states = args; }

    console.log('enableStates', states);

    _.each(states, state => this.mStates[state] ? this.mStates[state].attachAll() : console.warn(`state ${state} not defined`));

    return this;
  }

  /**
     * String containing state names separated by one <space>
     * @param [states] - leave empty to disable all registered
     */
  disableStates (...args) {
    let states;

    if (args.length == 0) { states = Object.keys(this.mStates); } else if (args.length == 1) { states = args[0].split(/\s+/); }
    if (args.length > 1) { states = args; }

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

  active () {
    return this.attached;
  }

  /**
     *
     * @param {HTMLElement} target
     * @param {String} name
     * @param {function} handler
     * @param options - {@link https://developer.mozilla.org/de/docs/Web/API/EventTarget/addEventListener}
     * @returns {EventListenerList}
     */
  add (target, name, handler, options) {
    if (!name) console.error('EventListenerList missing name');
    if (!handler) console.error('EventListenerList missing handler for: ', name);

    this.mList.push({target, name, handler, options});
    return this;
  }

  attachAll () {
    if (this.attached) {
      console.warn('EventListenerList already attached all events');
      return this;
    }
    console.log('attachAll', this.mList);
    this.mList.forEach(({target, name, handler, options}) => target.addEventListener(name, handler, options));
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
