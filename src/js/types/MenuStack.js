import * as _ from 'lodash';

import {createHTML} from '../utils/dom-utils';

import 'collections/shim-array';
import 'collections/listen/array-changes';

import waitUntil from 'wait-until';

let menustackinit = false;

// TODO
const createEscHotkey = (cb) => {
  let Hotkeys = AFRAME.nk.Hotkeys;
  Hotkeys.register('return to previous menu', 'esc');
  Hotkeys().on('return to previous menu', cb);
};

/**
 * FIXME wft extending array does not expose methods? babel transpile has problems with array
 * TODO use npm collections or similar instead
 *
 * - set available menus
 * - push menus onto stack that will be visible until a pop event was triggered
 *
 * - set always visible or background stuff
 *
 * - recursivly push stacks of menus
 *
 * - push either a string or and instance of a HTMLElement or a menu stack itself
 *
 */
export class MenuStack {
  constructor (...args) {
    this.mStack = [];
    this.mItems = {};
    this.hasRoot = false;
    _.each(args, (v, k) => this.mItems[v.id] = v);
  }

  /**
     * if root is set the stack will not remove the first element every
     */
  setRoot (ids) {
    this.mStack.push({parent, ids});
    this.hasRoot = true;
    return this;
  }

  setParent (selector) {
    waitUntil()
      .interval(200)
      .times(Infinity)
      .condition(() => {
        return !!document.querySelector(selector);
      })
      .done((result) => {
        this.mParent = document.querySelector(selector);
      });

    return this;
  }

  /**
     *
     * @param {HTMLElement} parent - the oarent container that contains one or more child elements with with the id parameter
     * @param {string} ids - comma separated list of id
     */
  push (ids) {
    if (this.mStack.length > 0) {
      this.setVisiblilityByIds(_.last(this.mStack).ids, false);
    }
    this.mStack.push({ids});

    if (!menustackinit) {
      createEscHotkey(() => this.onMenuBack());
      menustackinit = true;
    }

    ids = ids.split(', ').map(n => n.trim());

    let menus = this.mParent.childNodes.toArray().filter(n => n.nodeType != 3);
    _.each(menus, function (node, k) {
      node.setAttribute('visible', ids.indexOf(node.getAttribute('id')) >= 0);
      node.flushToDOM();
    });
  }

  setVisiblilityByIds (ids, visible) {
    if (!ids) return;

    ids = ids.split(', ').map(n => n.trim());

    let menus = this.mParent.childNodes.toArray().filter(n => n.nodeType != 3);
    _.each(menus, function (node, k) {
      if (ids.indexOf(node.getAttribute('id')) >= 0) {
        node.setAttribute('visible', visible);
      }
      node.flushToDOM();
    });
  }

  onMenuBack () {
    if (this.mStack.length <= Number(this.hasRoot)) return;

    let lastLayer = this.mStack.pop();

    this.setVisiblilityByIds(lastLayer.ids, false);

    this.setVisiblilityByIds(_.last(this.mStack).ids, true);
  }
}

/**

 * @type {MenuStack}
 */
export
class MenuStackItem {
  constructor (id, factory) {
    this.id = id;
    this.factory = factory;
  }

  get () {
    if (this.instance) return this.instance;
    this.instance = this.factory();

    return this.instance;
  }

  static fromId (id) {
    return new MenuStackItem(id, () => {
      return document.querySelector('#' + id);
    });
  }

  static fromTemplate (id, template) {
    return new MenuStackItem(id, () => {
      return createHTML(template);
    });
  }
}

/**
 * TODO don't forget to support multiple separate parts
 * FIXME MenuStackItems are not used currently
 * also instancing items should use heuristics
 *
 * @type {MenuStack}
 */

export var MainMenuStack = new MenuStack(...[
  MenuStackItem.fromId('m-main-menu'),
  MenuStackItem.fromId('player-hud'),
  MenuStackItem.fromId('background-panel region-select-menu'), // TODO test multiple parts that could be instaced in advance
  MenuStackItem.fromId('sample-config-menu'),
  MenuStackItem.fromId('about-menu'),
  MenuStackItem.fromId('flow-test-menu')
])
  .setRoot('m-main-menu')
  .setParent('[hud-hud]');
