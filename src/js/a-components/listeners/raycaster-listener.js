/**
 *
 * attach this to a matching HTMLElement, (a-hud or [hud-hud])
 */
import * as _ from 'lodash';

console.error('fix hud raycaster, ortho camera aspect on resize,el.emit, ');
AFRAME.registerComponent('hud-raycaster-helper', {
  schema: {},
  init: function () {
    var rc = document.querySelector('[raycaster]');// TODO this does not wait for a raycaster to be attached by another component

    if (!rc) {
      console.error('hud-raycaster-helper needs an entity with a raycaster to be able to inject hud interaction');
      return;
    }

    // intercept raycast and enable visibility for a moment
    var meshes = [], mStats = [];
    rc.addEventListener('before-raycast', () => {
      this.el.setAttribute('visible', true);

      meshes = AFRAME.nk.querySelectorAll(this.el, '.Mesh');
      mStats = meshes.map((m, k) => [m.renderOrder, m.material.depthTest]);
      meshes.map(m => {
        m.renderOrder = 999;
        m.material.depthTest = false;
      });
    });
    rc.addEventListener('after-raycast', () => {
      this.el.setAttribute('visible', false);

      meshes.map((m, k) => {
        m.renderOrder = mStats[k][0];
        m.material.depthTest = mStats[k][1];
      });
    });
  }
});

/**
 * Injects THREE::Raycaster.intersectObject with event emitters for before-raycast and after-raycast
 * which the user can start listening to.
 * FIXME this will break or interfere with performance utils
 */

console.error('raycaster-listener will break or interfere with performance utils');
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
    var intersects = optionalTarget || [];

    el.emit('before-raycast');
    intersectObject(object, this, intersects, recursive);
    el.emit('after-raycast');
    intersects.sort(ascSort);

    return intersects;
  };

  rc.intersectObjects = function (objects, recursive, optionalTarget) {
    var intersects = optionalTarget || [];

    if (Array.isArray(objects) === false) {
      console.warn('THREE.Raycaster.intersectObjects: objects is not an Array.');
      return intersects;
    }

    el.emit('before-raycast');
    for (var i = 0, l = objects.length; i < l; i++) {
      intersectObject(objects[i], this, intersects, recursive);
    }
    el.emit('after-raycast');

    intersects.sort(ascSort);

    window.intersects = intersects;
    if (_.has(intersects[0], 'object.el')) { console.log('rc:intersects[0].object.el.tagName', intersects[0].object.el.tagName); } else { console.log('rc:intersects[0]', intersects[0]); }

    return intersects;
  };
}
