import {zDepthForHeight, zDepthForWidth} from '../utils/hud-utils';
import * as _ from 'lodash';
import {FPSCtrl} from '../utils/fps-utils';

AFRAME.registerPrimitive('a-hud', {
  defaultComponents: {
    'hud-hud': {}
  },
  mappings: {defaultLight: 'hud-hud.defaultLight',
    'camera-mode': 'hud-hud.camera',
    'size': 'hud-hud.size',
    'aspect': 'hud-hud.aspect'
  }
});

/**
 * specialized element that waits for after-render event and renders elements on top
 * TODO (only for opaque elements)before-render and set zbuffer write to closest so that for opaque elements rendering behind them is not prolonged unnecessarily
 * the gui should have similar options like css image background cover contain
 *
 * TODO be able to configure aspect: 16:9 4:3 3:4 ... (default 1:1)
 *
 */

AFRAME.registerComponent('hud-hud', {
  dependencies: [],
  schema: {
    defaultLight: {type: 'boolean', default: true},
    height: {type: 'number', default: 1},
    width: {type: 'number', default: 1},
    aspect: {type: 'vec2', default: '1 1'},
    size: {type: 'string', default: 'contain', oneOf: ['contain', 'cover']},
    camera: {type: 'string', default: 'orthogonal', oneOf: ['orthogonal', 'perspective']}
    // TODO aspect
  },
  isOrtho: function () {
    return this.data.camera == 'orthogonal';
  },
  init: function () {
    // if (arguments.length != 100) return;
    // hide from default render pass
    this.el.setAttribute('visible', false);
    // set the element at "z-index" -1

    if (this.isOrtho()) {
      this.el.setAttribute('position', '0 0 -1');
    }

    this.mRenderer = this.el.sceneEl.renderer;

    // wait for after-render event
    this.el.sceneEl.addEventListener('after-render', this.renderHUD.bind(this));

    // listen for resize events
    window.addEventListener('resize', _.throttle(this.resizeHUD.bind(this), 20));
    // initial resize
    setTimeout(() => this.resizeHUD(), 100);

    // -----------------------------------------
    var scene = new THREE.Scene();
    // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    if (this.data.defaultLight) {
      var light = new THREE.AmbientLight(0xFFFFFF); // soft white light
      scene.add(light);
    }
    var renderer = this.mRenderer;

    scene.add(this.el.object3D.parent);

    this.mScene = scene;
  },
  update: function (oldData) {
    if (this.data.camera != oldData.camera) {
      this.resizeHUD();
    }

    if (this.data.size != oldData.size) {
      this.resizeHUD();
    }

    if (this.data.aspect != oldData.aspect) {
      this.resizeHUD();
    }
  },
  renderHUD: function () {
    // ------------

    let ac = this.mRenderer.autoClear;

    this.mRenderer.autoClear = false; // important!
    // TODO prevent matrix updates if unnecessary

    this.mRenderer.clearDepth(); // important! clear the depth buffer

    // var camera = this.el.sceneEl.camera;
    var camera = this.mCamera;

    this.el.object3D.visible = true;

    this.mRenderer.render(undefined, this.mScene, camera);

    this.el.object3D.visible = false;

    this.mRenderer.autoClear = ac; // restore auto clear value
  },
  resizeHUD_Ortho: function () {
    // let camera = this.el.sceneEl.camera;

    // TODO contain//cover for ortho the same way it is implemented for perspective
    // this.mCamera = this.createOrthographicCameraFromPerspectiveCamera(this.el.sceneEl.camera, this.el.object3D);

    let windowAspect = window.innerWidth / window.innerHeight;

    // FIXME instead of multiplying the targetAspect the element needs to be scaled
    let targetAspect = 1;// this.data.aspect.x / this.data.aspect.y;

    // console.log('targetAspect', targetAspect);

    // test here when back

    var [width, height] = [1, 1];

    if (this.data.size == 'contain') {
      if (windowAspect > 1) {
        width = windowAspect / targetAspect;
        height = 1;
      } else {
        width = 1;
        height = 1 / windowAspect / targetAspect;
      }
    }

    if (this.data.size == 'cover') {
      if (windowAspect > 1) {
        width = 1;
        height = 1 / windowAspect / targetAspect;
      } else {
        width = windowAspect / targetAspect;
        height = 1;
      }
    }

    this.mCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);
    this.mCamera.isOrthographicCamera = true;

    this.el.object3D.parent.add(this.mCamera);
  },
  resizeHUD_Perspective: function () {
    this.mCamera = this.el.sceneEl.camera;

    let camera = this.el.sceneEl.camera;
    // Note: (for a perspective camera only) code to set the z position of the HUD element and thus "resizing" the HUD
    let zDepth;

    if (this.data.size == 'contain') {
      zDepth = camera.aspect > 1 ? zDepthForHeight(this.data.height, camera) : zDepthForWidth(this.data.width, camera);
    } else if (this.data.size == 'cover') {
      zDepth = camera.aspect > 1 ? zDepthForWidth(this.data.width, camera) : zDepthForHeight(this.data.height, camera);
    } else console.warn("'size' unknown property:", this.data.size);

    this.el.object3D.position.z = -zDepth;
  },
  resizeHUD: function () {
    if (this.isOrtho()) {
      this.resizeHUD_Ortho();
    } else {
      this.resizeHUD_Perspective();
    }

    // ------------------------------------
  },
  /**
     *
     * Create orthogonal  camera from a perspective camera.
     *
     *  Note: based on {@link https://stackoverflow.com/questions/48758959/what-is-required-to-convert-threejs-perspective-camera-to-orthographic}
     *
     * @param {THREE.PerspectiveCamera} perspCamera
     * @param {THREE.Object3D} [objectPlane] if this parameter is set we'll calculate a dependent depth value which changes width and height of the viewport of the orth camera.
     * @returns {THREE.OrthographicCamera}
     */
  createOrthographicCameraFromPerspectiveCamera: function (perspCamera, objectPositionVector) {
    // setup some params
    let width = 1, height = 1;// we use a rectangle with normalized dimensions
    let fov_y = perspCamera.fov;
    let near = perspCamera.near;
    let far = perspCamera.far;

    // First you have to calcualte the depth of the object.
    // THREE.Vector3 : positon of the object
    var v3_camera = perspCamera.position;

    // normalized default
    let depth = -1;
    // if the object parameter is set we'll calculate a dependent depth value instead
    if (objectPositionVector && objectPositionVector.sub) {
      var line_of_sight = new THREE.Vector3();
      perspCamera.getWorldDirection(line_of_sight);

      var v3_distance = objectPositionVector.clone().sub(v3_camera);
      depth = v3_distance.dot(line_of_sight);
    }
    // Then you have to calculate the "size" of the rectangle which is projected to the viewport at the depth:
    let aspect = width / height;

    let height_ortho = depth * 2 * Math.atan(fov_y * (Math.PI / 180) / 2);
    let width_ortho = height_ortho * aspect;

    // With these values the THREE.OrthographicCamera can be setup like this:

    var orthoCamera = new THREE.OrthographicCamera(
      width_ortho / -2, width_ortho / 2,
      height_ortho / 2, height_ortho / -2,
      near, far);
    orthoCamera.position.copy(perspCamera.position);

    //  The position and direction of the perspective camera can be committed to the orthographic camera like this:

    orthoCamera.position.copy(perspCamera.position);
    orthoCamera.quaternion.copy(perspCamera.quaternion);

    return orthoCamera;
  }
});
