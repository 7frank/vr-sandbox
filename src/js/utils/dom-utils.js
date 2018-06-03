import $ from 'jquery';

/**
 * simple replacement for jquery("<div>") e.g.
 * TODO only jquery does create the entity as expected. every other implementation doesnt initialise the components
 * @param domstring
 * @returns {*|Node|exports.TreeWalkerImpl.firstChild|null}
 */

export
function createHTML (html) {
  return $(html).get(0);
}
/*
export
const createHTML = (domstring) => {
  if (domstring == null) throw new Error('needs param');
  let html = new DOMParser().parseFromString(domstring, 'text/html');
  return html.body.firstChild;
};
*/

// Access-Control-Expose-Headers:Content-Length, X-My-Custom-Header, X-Another-Custom-Header
// TODO refactor into nk-window class and wait for appendCallback
export
function setCenter (el) {
  var child = $(el);
  var parent = $(el.parentElement);
  child.css('position', 'absolute');

  var top = ((parent.height() - child.outerHeight()) / 2) + parent.scrollTop();
  child.css('top', (top > 0 ? top : 0) + 'px');
  child.css('left', ((parent.width() - child.outerWidth()) / 2) + parent.scrollLeft() + 'px');
}

export function appendStyle (css) {
  var head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

/**
 * An alternative version of AFRAME.utils.shouldCaptureKeyEvent which checks if an element is contained within the scene element.
 * This check works better when using hotkeys and the keyboard input library.
 *
 * @param {HTMLElement} el
 * @param {Event} event
 * @returns {boolean}
 */

export function shouldCaptureKeyEvent (el, event) {
  // FIXME fix keyboardinput library currentTarget
  if (event.currentTarget == window) return true;

  return el.sceneEl.contains(event.currentTarget);
}
