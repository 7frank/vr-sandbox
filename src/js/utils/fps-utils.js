import {NumberQueue} from '../types/NumberQueue';
import {globStringToRegex} from './misc-utils';
import * as _ from 'lodash';

import {FPSCtrl as _FPSCtrl} from '@nk11/animation-lib/src/js/animation/FPSCtrl';

/**
 * @callback onFrameCallback
 * @param {object} info - An object containing additional information of the current frame.
 * @param {number} info.time - A timestamp.
 * @param {number} info.frame - The auto incrementation identifier of the current frame.
 * @param {FPSCtrl} info.script - A reference to the FPSCtrl itself.
 *
 */

/**
 * Extending the fps limiter here with a fe additional sugar
 * TODO have a rnd region option that randomizes fps to prevent many scripts to run exactly at the same time and make the rendering stutter therefor change signature
 * TODO when changing fps, the frame counter will reset which might interfere with some future user logic
 * TODO add additional options
 *      -like priority queues for more relevant and less important
 *      -track all scripts run directly
 *
 * TODO what to do with this kind of overloading .... FPSCtrl as _FPSCtrl ?
 */

export class FPSCtrl extends _FPSCtrl {
  /**
     * @param {number} fps - A Number indicating the times per second 'onFrame' gets called.
     * @param {onFrameCallback} onFrame - A callback function.
     * @param {object} [context] - A context the 'onFrame' functions gets bound to.
     * @constructor
     */

  constructor (fps, onFrameCallback, object) {
    super(fps, onFrameCallback, object);
    this.mQueue = new NumberQueue(10);

    this.on('frame', () => {
      this.mQueue.enqueue(this.mTimer.getElapsedTime());
    });
  }

  /**
     * Returns the average time(in milliseconds) it took to compute the target function.
     * @returns {{averageTime: number, target: *}}
     */
  getPerformanceInfo () {
    var tAvg = this.mQueue.getAverage() * 1000;
    return {
      averageTime: tAvg,
      fps: this.mMaxFPS,
      impact: this.isPlaying ? tAvg * this.mMaxFPS : 0, // returns average mSeconds per second
      target: this.mFunction,
      context: this.mContext ? this.mContext : null
    };
  }
}

/**
 *
 * @param {FPSCtrl[]} fpsCtrls
 * @constructor
 */
export function FPSInfo (category) {
  var fpsCtrls = [];
  return {

    add: function (name, item) {
      fpsCtrls.push({
        name, item

      });
      return this;
    },
    addScripts: function (scripts) {
      _.each(scripts.mScripts, script => this.add(script.name, script.instance));

      return this;
    },
    compile: function () {
      return fpsCtrls.map(function (fps) {
        var info = fps.item.getPerformanceInfo();
        return {
          details: info,
          impact: info.impact,
          description: category + ' - ' + fps.name
        };
      });
    }

  };
}

/**
 * Container class for scripts that are re-run at a certain interval.
 */

export class Scripts {
  /**
     * provide a context for all scripts added
     * @param context
     */
  constructor (context) {
    this.mScripts = {};
    this.mContext = context;
    this.mShared = {};
  }

  /**
     * Add one script that will run as soon as the {@link play} method is called.
     * @param name - A unique script name which it is referenced by.
     * @param fps
     * @param handler
     * @returns {Scripts}
     */
  add (name, fps, handler) {
    if (this.mScripts[name]) throw new Error('Script name must be unique. Dound duplicate for:' + name);

    if (this.mContext) {
      handler = handler.bind(this.mContext);
    }

    var that = this;
    var instance = new FPSCtrl(fps, function (e) {
      handler(e, that.mShared);
    });

    this.mScripts[name] = {name, instance};
    return this;
  }

  pause (selectors = '*') {
    var scripts = this.getMatchingScripts(selectors);

    for (var script of scripts) {
      script.instance.pause();
    }
    return this;
  }

  /**
     *
     * @param selectors
     * @returns {Scripts}
     */
  play (selectors = '*') {
    var scripts = this.getMatchingScripts(selectors);
    for (var script of scripts) {
      script.instance.start();
    }
    return this;
  }

  getMatchingScripts (selectors) {
    var matches = [];
    var scripts = Object.keys(this.mScripts);

    var selectorsArray = selectors.split(',');

    for (var selector of selectorsArray) {
      var regexp = globStringToRegex(selector);

      for (var s of scripts) {
        if (s.match(regexp)) matches.push(this.mScripts[s]);
      }
    }
    return matches;
  }
}
