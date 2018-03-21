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
