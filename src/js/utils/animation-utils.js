
/**
 * works if component has animation-mixer attribute attached only
 *
 * @param el
 * @returns {String[]}
 */
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
