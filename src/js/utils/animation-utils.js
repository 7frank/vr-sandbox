
import TWEEN from '@tweenjs/tween.js';

import {Animation} from '@nk11/animation-lib/src/js/animation/Animation';

global.Animation = Animation;

alert('refactor code with animation lib ');
alert('try setting up lerna multi  repo');

/**
 *
 * @param origObject
 * @returns {{animate: (function(this:AnimationFactory)), stop: stop}}
 * @constructor
 */
export function AnimationFactory (origObject) {
  if (typeof origObject === 'undefined') throw new Error('must be an object');

  // https://github.com/tweenjs/tween.js/issues/78
  // Flatten/Deflate an object
  var flatten = function (source, pathArray, result) {
    pathArray = (typeof pathArray === 'undefined') ? [] : pathArray;
    result = (typeof result === 'undefined') ? {} : result;
    var key, value, newKey;
    for (var i in source) {
      if (source.hasOwnProperty(i)) {
        key = i;
        value = source[i];
        pathArray.push(key);

        if (typeof value === 'object' && value !== null) {
          result = flatten(value, pathArray, result);
        } else {
          newKey = pathArray.join('.');
          result[newKey] = value;
        }
        pathArray.pop();
      }
    }
    return result;
  };

  function ref (obj, str) {
    return str.split('.').reduce(function (o, x) {
      return o[x];
    }, obj);
  }

  // Move values from a flatten object to its original object
  function returnValue (obj, flattened, key) {
    let parts = key.split(/\.(?=[^.]+$)/); // Split "foo.bar.baz" into ["foo.bar", "baz"]
    if (parts.length == 1) {
      obj[parts[0]] = flattened[key];
    } else {
      ref(obj, parts[0])[parts[1]] = flattened[key];
    }
  }

  function getValue (obj, key) {
    let parts = key.split(/\.(?=[^.]+$)/); // Split "foo.bar.baz" into ["foo.bar", "baz"]
    if (parts.length == 1) {
      return obj[parts[0]];
    } else {
      return ref(obj, parts[0])[parts[1]];
    }
  }

  var tween;
  return {
    animate: function (options = {}, mDuration = 400, onComplete, onUpdate) {
      if (tween) tween.stop();

      var mTimeout;
      var that = origObject;// this;
      var stopped = false;

      var flattened_to = flatten(options);

      var keys = Object.keys(flattened_to);
      var flattened_from = {};
      keys.forEach(k => flattened_from[k] = getValue(that, k));

      // whenever animation is completed or stopped
      function onFinish () {
        cancelAnimationFrame(mTimeout);

        stopped = true;
        if (typeof onComplete === 'function') {
          onComplete.bind(origObject)();
        }
      }

      tween = new TWEEN.Tween(flattened_from);
      tween.to(flattened_to, mDuration)
        .onUpdate(function (values) {
          // Move the values from the flattened and tweening object
          // to the original object

          for (let key in values) {
            returnValue(that, values, key);
          }
          if (typeof onUpdate === 'function') onUpdate.bind(that)();
        })
        .onComplete(onFinish).onStop(onFinish)
        .start();

      mTimeout = requestAnimationFrame(animate);

      function animate (time) {
        if (stopped) return;

        tween.update(time);
        mTimeout = requestAnimationFrame(animate);
      }

      return this;
    },
    stop: function () {
      tween.stop();
    }

  };
}
