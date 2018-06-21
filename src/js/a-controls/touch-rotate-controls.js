import 'three/examples/js/controls/OrbitControls';
import * as _ from 'lodash';

/**
 * orbit controls for entities
 *
 *
 **/

AFRAME.registerComponent('touch-rotate-controls', {

  schema: {distance: {type: 'vec2', default: '0, Infinity'}},

  init: function () {
    // have a camera of the controls
    let cameraContainer = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    cameraContainer.position.set(0, 0, -1);
    this.el.setObject3D('touch-rotate-controls-camera', cameraContainer);

    this.mControls = new THREE.OrbitControls(cameraContainer, this.el.sceneEl.renderer.domElement);
    this.mControls.enablePan = false;

    this.mControls.minDistance = this.data.distance.x;
    this.mControls.maxDistance = this.data.distance.y;

    // TODO not 100% working when rotating and zooming (keeps stuck)
    // should not be enabled if user does not interact
    // TODO touch pointer controls too ..
    this.el.addEventListener('focus', () => {
      this.mControls.enabled = true;
    });
    this.el.addEventListener('mousemove', () => {
      this.mControls.enabled = true;
    });
    this.el.addEventListener('mouseleave', () => {
      this.mControls.enabled = false;
    });
  },
  tick: function () {
    let cam = this.mControls.object;

    // TODO
    // if (this.mControls.enablePan) { this.el.object3D.position.copy(this.mControls.target); }
    this.el.object3D.quaternion.copy(cam.quaternion);
    let scale = 1 / (cam.position.length() - this.mControls.target.length());
    // let scale = cam.zoom ? cam.zoom : 1;
    this.el.object3D.scale.set(scale, scale, scale);
  }

});
