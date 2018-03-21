import {NumberQueue} from '../types/NumberQueue';

/**
 * a simple fps limiter
 *
 * for reference see https://stackoverflow.com/a/19773537
 * TODO when changing fps, the frame counter will reset which might interfere with some future user logic
 * Implements some additional performance measurement to keep track of frames that are really slow.
 * TODO own file
 * //TODO add additional options
 * //--like priority queues for more relevant and less important
 * //track all scripts run directly
 *
 * TODO have a rnd region option that randomizes fps to prevent many scripts to run exactly at the same time and make the rendering stutter
 * //TODO therefor change signature
 *
 * FPSCtrl(fps,onFramae,options)
 *
 */

export function FPSCtrl (fps, onFrame, context) {
  var delay = 1000 / fps, // calc. time per frame
    time = null, // start time
    frame = -1, // frame count
    tref; // rAF time reference

  var infoQueue = new NumberQueue(10); // store last 10 calls //TODO make size dependent on fps or calc impact differently (for low fps the impact will change slower over time)
  var timer = new THREE.Clock(false);

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
        frame: frame
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
 * container class with some convenience functions
 * TODO implementation :>
 */

export class AiScripts {
  constructor () {
    this.scripts = {};
  }

  add (name, handler) {
    this.scripts.name = {};
  }

  pause (name) {

  }

  play () {

  }
}
