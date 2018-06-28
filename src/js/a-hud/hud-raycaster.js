/**
 * raycasts into the hud-hud
 */

import * as _ from 'lodash';

AFRAME.registerComponent('hud-raycaster', {
  dependencies: ['hud-hud'],
  schema: {},
  init: function () {
    var renderer = this.el.sceneEl.renderer;

    this.mHud = this.el.components['hud-hud'];
    this.mRayCaster = new THREE.Raycaster();
  },
  getIntersected: _.throttle(function () {
    let mousePosition = this.el.sceneEl.systems.pointer.position;

    this.mRayCaster.setFromCamera(mousePosition, this.mHud.mCamera);
    let recursiveFlag = true;

    let intersected = this.mRayCaster.intersectObjects(this.el.object3D.children, recursiveFlag);
    let hasEl = _.filter(intersected, (o) => _.has(o, 'object.el'));
    this.intersected = _.uniqBy(hasEl, (o) => _.get(o, 'object.el'));

    let res = hasEl.map(o => _.get(o, 'object.el'));
    this.intersectedEls = _.uniq(res);
    /* if (this.intersectedEls.length > 0) {
          console.log('hud-raycaster intersectedEls', this.intersectedEls);
          window.ooo = this.intersectedEls;
        } */
    return this.intersected;
  }, 5),
  tick: function () {
    this.getIntersected();
  }

})
;
