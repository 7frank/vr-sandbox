import * as _ from 'lodash';

export function getFileExt (file) {
  return file.name.split('.').pop();
}

export function addScript (src, load) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.onload = resolve;
    s.onerror = reject;
    s.setAttribute('src', src);
    document.head.appendChild(s);
  });
}

/**
 * simple templating helper
 * for reference see Mod of Douglas Crockford's String.prototype.supplant
 * example: template("hello {test}")({test:"world"})
 */

export function template (str) {
  return function template (o) {
    return str.replace(/{([^{}]*)}/g, function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  };
}

/**
 * Converts shell wildcard string into regular expression.
 *
 * @param str - The String  containing '*' wildcards.
 * @returns {RegExp}
 */
export function globStringToRegex (str) {
  return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');
}

/**
 * Used for {@link globStringToRegex}.
 * @param str
 * @param delimiter
 * @returns {string}
 */
function preg_quote (str, delimiter) {
  // http://kevin.vanzonneveld.net
  // +   original by: booeyOH
  // +   improved by: Ates Goral (http://magnetiq.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: preg_quote("$40");
  // *     returns 1: '\$40'
  // *     example 2: preg_quote("*RRRING* Hello?");
  // *     returns 2: '\*RRRING\* Hello\?'
  // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
  // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
  return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

/**
 * Like throttle but for events as first arguments. suppresses propagation so the event isn't bubbling while no further handling occurs.
 * This is particularly helpful for 3d menus where the same keys are used like for menu navigation, therefor preventing movement of player while navigating.
 * @param fn
 * @param wait
 * @returns {Function}
 */
export function suppressedThrottle (fn, wait) {
  var time = Date.now();
  var res;
  return function (e) {
    if ((time + wait - Date.now()) < 0) {
      res = fn.apply(this, arguments);
      time = Date.now();
      return res;
    } else {
      e.stopPropagation();
      return res;
    }
  };
}

/**
 *
 * @param fn the function that gets throttled
 * @param wait - the time to wait until the throttled function gets invoked
 * @param butFn - the function that get called every time
 * @returns {Function}
 */
export function throttleFinally (fn, wait, butFn) {
  var time = Date.now();
  var res;
  return function (e) {
    if ((time + wait - Date.now()) < 0) {
      res = fn.apply(this, arguments);
      time = Date.now();
    }
    let res2 = butFn.apply(this, arguments);
    return res;
  };
}

export function roundTo (number, interval) {
  return (_.round(number / interval) * interval);
}

export function isURL (str) {
  return /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/.test(str);
}

/**
 * Creates a tree structure from an array.

 * @param items
 * @param config
 * @returns {Array}
 */
export
function arrayToTree (items, config) {
  if (config === void 0) {
    config = {id: 'id', parentId: 'parentId'};
  }
  // the resulting unflattened tree
  var rootItems = [];
  // stores all already processed items with ther ids as key so we can easily look them up
  var lookup = {};
  // idea of this loop:
  // whenever an item has a parent, but the parent is not yet in the lookup object, we store a preliminary parent
  // in the lookup object and fill it with the data of the parent later
  // if an item has no parentId, add it as a root element to rootItems
  for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
    var item = items_1[_i];
    var itemId = _.get(item, config.id);
    var parentId = _.get(item, config.parentId);

    // look whether item already exists in the lookup table
    if (!Object.prototype.hasOwnProperty.call(lookup, itemId)) {
      // item is not yet there, so add a preliminary item (its data will be added later)
      lookup[itemId] = {data: null, children: []};
    }
    // add the current item's data to the item in the lookup table
    lookup[itemId].data = item;
    var TreeItem = lookup[itemId];
    if (config.rootFunc(TreeItem) == true) {
      // is a root item
      rootItems.push(TreeItem);
    } else {
      // has a parent
      // look whether the parent already exists in the lookup table
      if (!Object.prototype.hasOwnProperty.call(lookup, parentId)) {
        // parent is not yet there, so add a preliminary parent (its data will be added later)
        lookup[parentId] = {data: null, children: []};
      }
      // add the current item to the parent
      lookup[parentId].children.push(TreeItem);
    }
  }
  return rootItems;
}

export
function forceStopPlayerMovement () {
  window.dispatchEvent(new Event('player-force-stop'));
}
