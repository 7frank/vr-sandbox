/**
 * raycasts into the hud-hud
 */

import * as _ from 'lodash';

AFRAME.registerComponent('hud-raycaster', {
  dependencies: ['hud-hud'], //, 'raycaster', 'raycaster-listener'
  schema: {},
  init: function () {
    this.mMouse = new THREE.Vector2();

    var renderer = this.el.sceneEl.renderer;

    document.addEventListener('mousemove', (e) => {
      this.mMouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      this.mMouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    }, false);

    this.mHud = this.el.components['hud-hud'];
    this.mRayCaster = new THREE.Raycaster();// this.el.components.raycaster;

    // remove if not necessary
    /* this.mRayCaster.updateOriginDirection = () => {
      this.mRayCaster.raycaster.setFromCamera(this.mMouse, this.mHud.mCamera);
    }; */
  },
  tick: _.throttle(function () {
    this.mRayCaster.setFromCamera(this.mMouse, this.mHud.mCamera);
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
  }, 30)

})
;
