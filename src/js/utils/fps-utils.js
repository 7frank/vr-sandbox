import {NumberQueue} from '../types/NumberQueue';
import {querySelectorAll} from './selector-utils';
import {globStringToRegex} from './misc-utils';
import * as _ from 'lodash';

/**
 * @callback onFrameCallback
 * @param {object} info - An object containing additional infos for the current frame.
 * @param {number} info.time - A timestamp.
 * @param {number} info.frame - The autoinc-id of the current frame.
 * @param {self} info.script - A reference to the FPSCtrl itself.
 *
 */

/**
 * A simple fps limiter. *
 * For reference on original code see https://stackoverflow.com/a/19773537
 *
 * TODO when changing fps, the frame counter will reset which might interfere with some future user logic
 * Implements some additional performance measurement to keep track of frames that are really slow.
 * //TODO add additional options
 * //--like priority queues for more relevant and less important
 * //track all scripts run directly
 *
 * TODO have a rnd region option that randomizes fps to prevent many scripts to run exactly at the same time and make the rendering stutter therefor change signature
 *
 *
 * @param {number} fps - A Number indicating the frames per second 'onFrame' gets called.
 * @param {onFrameCallback} onFrame - A callback function whose first param contains  'time'-timestamp, 'frame'-number,  'script'-this.
 * @param {object} context - a context the onFrame functions gets bound.
 * @constructor
 */
export function FPSCtrl (fps = 30, onFrame, context) {
  var delay = 1000 / fps, // calc. time per frame
    time = null, // start time
    frame = -1, // frame count
    tref; // rAF time reference

  var infoQueue = new NumberQueue(10); // store last 10 calls //TODO make size dependent on fps or calc impact differently (for low fps the impact will change slower over time)
  var timer = new THREE.Clock(false);

  var that = this;

  if (context != null) {
    onFrame = onFrame.bind(context);
  }

  this.mContext = context;

  function loop (timestamp) {
    if (time === null) time = timestamp; // init start time
    var seg = Math.floor((timestamp - time) / delay); // calc frame no.
    if (seg > frame) { // moved to next frame?
      frame = seg; // update

      timer.start();

      onFrame({ // callback function
        time: timestamp,
        frame: frame,
        script: that
      });

      infoQueue.enqueue(timer.getElapsedTime());
    }
    tref = requestAnimationFrame(loop);
  }

  // play status
  this.isPlaying = false;

  // set frame-rate
  this.frameRate = function (newfps) {
    if (!arguments.length) return fps;
    fps = newfps;
    delay = 1000 / fps;
    frame = -1;
    time = null;
  };

  this.getCurrentFPS = function () {
    return fps;
  };

  // enable starting/pausing of the object
  this.start = function () {
    if (!this.isPlaying) {
      this.isPlaying = true;
      tref = requestAnimationFrame(loop);
    }
    return this;
  };

  // circumvent fps limit
  // alter 'time' so the next time lop gets called the next frame will be updated
  this.forceNext = function () {
    time -= delay;
    return this;
  };

  this.pause = function () {
    if (this.isPlaying) {
      cancelAnimationFrame(tref);
      this.isPlaying = false;
      time = null;
      frame = -1;
    }
    return this;
  };

  /**
     * Returns the average time(in milliseconds) it took to compute the target function.
     * @returns {{averageTime: number, target: *}}
     */
  this.getPerformanceInfo = function () {
    var tAvg = infoQueue.getAverage() * 1000;
    return {
      averageTime: tAvg,
      fps: fps,
      impact: this.isPlaying ? tAvg * fps : 0, // returns average mSeconds per second
      target: onFrame,
      context: this.mContext ? this.mContext : null
    };
  };
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
