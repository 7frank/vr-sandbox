import * as _ from 'lodash';

/**
 *  Helper to create a recursive namespace object.
 *  Example: Use a string like "nk.my.ns" or an array like ['nk']['my-other-ns'].
 *  Note: this also will get the namespace if it was previously created.
 * @param {String|String[]} namespace - The string or array containing.
 * @param {object} base - A Object in which the namespace will be created.
 * @returns {object} Returns the last created leaf object of the namespace.
 */
export function createNamespace (namespace, base) {
  if (!base) {
    base = window;
  }

  var splitNs;

  if (_.isString(namespace)) {
    if (namespace == '') return base;
    splitNs = namespace.split('.');
  } else if (_.isArray(namespace)) {
    splitNs = namespace;
  } else {
    throw new Error('invalid argument');
  }

  if (splitNs.length == 0) {
    return base;
  }

  var builtNs = splitNs[0];

  var i;
  for (i = 0; i < splitNs.length; i++) {
  //  if (typeof (base[splitNs[i]]) == 'undefined') {
    if (base[splitNs[i]] == undefined || base[splitNs[i]] == null) {
      // we have to distinguish between last and all in between elements because we did override some via "=" operator wich would fail only defining the property
      if (i < splitNs.length - 1) {
        Object.defineProperty(base, splitNs[i], {value: {}, writable: false});
      } else {
        base[splitNs[i]] = {};
      }
    }

    base = base[splitNs[i]];
  }
  return base;
}

/**
 * Test if a certain namespace exists within an object
 * @param {String|String[]} namespace - The string or array containing.
 * @param {object} base - A Object that is used for the look up..
 * @returns {boolean} Returns true if the namespace exists otherwise false.
 */

export function namespaceExists (namespace, base) {
  if (!base) {
    base = window;
  }

  var splitNs = namespace.split('.');
  var builtNs = splitNs[0];

  var i;
  for (i = 0; i < splitNs.length; i++) {
    if (base[splitNs[i]] == undefined || base[splitNs[i]] == null) return false;
    base = base[splitNs[i]];
  }

  return true;
}

export function namespaceInfo (namespace) {
  var splitNs = namespace.split('.');

  let key = splitNs.pop();

  return {root: splitNs.join('.'), key};
}
