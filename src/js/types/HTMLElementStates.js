/**
 * a basic class to define and hold some states for e certain HTMLElement
 */

import * as _ from 'lodash';

export
class HTMLElementStates {
  /**
     *
     * @param {HTMLElement} el - the target the states will be applied to
     */
  constructor (el) {
    this.el = el;
    this.mStates = {none: {}};
    this.setState('none');
  }

  // TODO handle active states and undo
  setState (stateName) {
    var entries = this.mStates[stateName];
    var that = this;
    if (!entries) {
      console.warn('state ' + stateName + ' not registered');
      return;
    }
    _.each(entries, function (attributeValue, attrName) {
      that.el.setAttribute(attrName, attributeValue);
    });

    return this;
  }

  unsetState (stateName) {
    var entries = this.mStates[stateName];
    var that = this;
    if (!entries) {
      console.warn('state ' + stateName + ' not registered');
      return;
    }
    _.each(entries, function (attributeValue, attrName) {
      that.el.removeAttribute(attrName);
    });

    return this;
  }

  addState (name, options) {
    this.mStates[name] = options;

    return this;
  }
}
