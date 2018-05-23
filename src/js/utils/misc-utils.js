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

export function roundTo (number, interval) {
  return (_.round(number / interval) * interval);
}
