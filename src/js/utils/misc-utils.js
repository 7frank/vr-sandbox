export function addScript (src, load) {
  var s = document.createElement('script');
  s.onload = load;
  s.setAttribute('src', src);
  document.body.appendChild(s);
  return s;
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
export
function globStringToRegex (str) {
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
