import * as _ from 'lodash';

// the logger instance that currently is visible on the console
var activeLoggerTarget;

/**
 * a handler method for the proxy that caches method calls to window.console
 * @type {{get: handler.get}}
 */

var handler = {
  get: function (target, name) {
    if (typeof console[name] == 'function') {
      return function (...args) {
        target.cached.push({method: name, args});

        // for the last selected logger events are passed to the console
        if (activeLoggerTarget == target) { console[name].apply(console, args); }
      };
    } else {
      return target[name];
    }
  }
};

/**
 * The base factory that's used to create the actual logger.
 * TODO logs to console if logger is requested a second time
 */

class _Logger {
  /**
     * creates a logger that can be refreences by its name.
     * @param name
     * @param options - TODO have some meaningful options
     * @returns {*}
     */

  getLogger (name, options) {
    var obj = {cached: []};
    var proxy = new Proxy(obj, handler);

    if (this[name]) return this[name];

    Reflect.defineProperty(this, name, {
      get: function () {
        activeLoggerTarget = obj;

        clearConsole();

        _.each(proxy.cached, function (entry) {
          var key = entry.method;
          var args = entry.args;
          console[key].apply(console, args);
        });

        return proxy;
      },
      set: function (value) {
        console.warn("can't override");
      }
      /* writable: false,
                        configurable: false,
                        enumerable: true */
    });

    return proxy;
  }

  /**
     * Setting this to false will stop logging anything. This should prevent heap polution.
     * Primarily you want to use it in production to disable all logging.
     *
     * TODO check that it actually does what it should
     * @param {boolean} activateLogging
     */

  /* setState(activateLogging=true){
    this.bActive=  activateLogging
    } */
}

/**
 * The actual logger that buffers console logs errors warnings ..etc to different channels and keeps the console clean and structured until needed.
 * Similar to <b>java.util.logging.Logger</b> {@link https://docs.oracle.com/javase/8/docs/api/java/util/logging/Logger.html}
 *
 * FIXME sometime doesn't log stuff
 * TODO have a max life time per log entry to prevent memory growth
 * TODO have a silent option that not logs at all
 *
 * usage:
 *      (1) create a silent logger
 *
 *      var console = Logger.getLogger('sketchfab-browser');
 *
 *      (2) log to console
 *
 *      Logger['sketchfab-browser']
 *
 */

export const Logger = new _Logger();
window.Logger = Logger;

/**
 * utility clear console
 *
 */

function clearConsole () {
  var API;

  if (typeof console._commandLineAPI !== 'undefined') {
    API = console._commandLineAPI; // chrome
  } else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
    API = console._inspectorCommandLineAPI; // Safari
  } else if (typeof console.clear !== 'undefined') {
    API = console;
  }

  API.clear();
}
