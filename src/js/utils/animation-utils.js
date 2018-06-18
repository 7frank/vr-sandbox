/**
 * works if component has animation-mixer attribute attached only
 *
 * @param el
 * @returns {String[]}
 */
/**
 *
 *
 * animate(options:Object, mDuration : Number, onComplete:function)
 *
 * options does contain all the animated properties
 */

import TWEEN from '@tweenjs/tween.js';

export function getAnimationNames (el) {
  var component = el.components['animation-mixer'];
  if (!component) {
    console.warn("can't get animation names. does not have animation-mixer");
    return [];
  }

  // console.log(component, component.mixer);

  if (!component.mixer) return [];
  var availableActions = component.mixer._actions;
  var actionNames = availableActions.map((action) => action._clip.name);
  return actionNames;
}

export function playAnimation (el, animationName, tCrossfade) {
  var component = el.components['animation-mixer'];
  if (!component) {
    console.warn("can't run animation does not have animation-mixer ", animationName);
    return;
  }

  component.data.crossFadeDuration = tCrossfade;

  if (!component.mixer) return []; // TODO wait for initialisation of compoennt instead of discarding

  var actionNames = getAnimationNames(el);

  // todo have an info if no animation was played because none matched pattern
  //   if (actionNames.indexOf(animationName)==-1)

  component.stopAction();
  component.data.clip = animationName; // actionNames[4];
  component.playAction();

  /*
               var a = component.activeActions[0];

                var b = _.sample(component.mixer._actions);

                if (a) { a.crossFadeTo(b, tCrossfade); } else { b.fadeIn(tCrossfade); }

                */
}

/**
 *
 * @param origObject
 * @returns {{animate: (function(this:AnimationFactory)), stop: stop}}
 * @constructor
 */
export function AnimationFactory (origObject) {
  if (typeof origObject == 'undefined') throw new Error('must be an object');

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
        if (typeof onComplete == 'function') {
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
          if (typeof onUpdate == 'function') onUpdate.bind(that)();
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
