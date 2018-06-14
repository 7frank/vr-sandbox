/**
 * Injects THREE::Raycaster.intersectObject with event emitters for before-raycast and after-raycast
 * which the user can start listening to.
 * TODO this will break or interfere with performance utils
 *
 * Note: in addition currently the logic to merge the result of the hud raycasting is pu in here.
 *
 */
import * as _ from 'lodash';

console.warn('raycaster-listener will break or interfere with performance utils');
AFRAME.registerComponent('raycaster-listener', {
  dependencies: ['raycaster'],
  schema: {},
  init: function () {
    var raycasterComponent = this.el.components.raycaster;

    /* if (!raycasterComponent) {
          console.error('no raycaster at entity', this.el, 'for raycaster-listener');
          return;
        } */

    this.mRaycaster = raycasterComponent.raycaster;

    if (this.mRaycaster.__raycaster_listener__) {
      console.warn('already attached');
      return;
    }

    let raycasterFunction = this.mRaycaster.intersectObject;

    console.log('overrideRelevantRaycasterCode', this.mRaycaster, raycasterComponent.el);
    overrideRelevantRaycasterCode(this.mRaycaster, raycasterComponent.el);

    this.mRaycaster.__raycaster_listener__ = true;
  }
});

/**
 * This method contains copies of the raycaster code wich should be updated if code of original raycaster changes.
 * Only changes are the time tracking in the intersectObject function (@changed)
 *
 *
 *
 * @param {THREE.Raycaster} rc - An instance of the THREE.Raycaster
 */

function overrideRelevantRaycasterCode (rc, el) {
  if (Number(THREE.REVISION > 90)) {
    console.warn('raytrace performance tool needs compatibility revision');
  }

  // ----------------------------

  function ascSort (a, b) {
    return a.distance - b.distance;
  }

  function intersectObject (object, raycaster, intersects, recursive) {
    if (object.visible === false) return;

    /*  // @changed
                    var t0 = performance.now();
                   */
    object.raycast(raycaster, intersects);
    /*  var t1 = performance.now();
                    // if (!children.length) //only store leaf nodes
                    var info = {time: t1 - t0, object, intersects};
                    tmpRaycastStack.push(info);
                */
    if (recursive === true) {
      var children = object.children;

      for (var i = 0, l = children.length; i < l; i++) {
        // var t0 = performance.now();
        intersectObject(children[i], raycaster, intersects, true);
        // var t1 = performance.now();
        // info.cTime = t1 - t0;
      }
    }
  }

  rc.intersectObject = function (object, recursive, optionalTarget) {
    console.error('if this error occurs then some refactoring needs to be done here or try to use intersectObjects instead ');
    /* var intersects = optionalTarget || [];

      el.emit('before-raycast');
      intersectObject(object, this, intersects, recursive);
      el.emit('after-raycast');
      intersects.sort(ascSort);

      return intersects; */
  };

  rc.intersectObjects = function (objects, recursive, optionalTarget) {
    var intersects = optionalTarget || [];

    if (Array.isArray(objects) === false) {
      console.warn('THREE.Raycaster.intersectObjects: objects is not an Array.');
      return intersects;
    }
    // -------------------------
    // emitting two additional events before- and after- raycast
    el.emit('before-raycast');
    for (var i = 0, l = objects.length; i < l; i++) {
      intersectObject(objects[i], this, intersects, recursive);
    }
    el.emit('after-raycast');

    intersects.sort(ascSort);
    // -------------------------
    // merging the result of the scene-raycast with the one of the HUD
    let hrc = document.querySelector('[hud-raycaster]');
    if (hrc) {
      //    let hudIntersected = hrc.components['hud-raycaster'].intersected;
      let hudIntersected = hrc.components['hud-raycaster'].getIntersected();

      if (hudIntersected) {
        hudIntersected.sort(ascSort);
        intersects.unshift(...hudIntersected);
      }
    }
    // -------------------------

    return intersects;
  };
}
