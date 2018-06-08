import {zDepthForHeight, zDepthForWidth} from '../utils/hud-utils';
import * as _ from 'lodash';

AFRAME.registerPrimitive('a-hud', {
  defaultComponents: {
    'hud-hud': {}
  },
  mappings: {defaultLight: 'hud-hud.defaultLight'}
});

/**
 * specialized element that waits for after-render event and renders elements on top
 * TODO (only for opaque elements)before-render and set zbuffer write to closest so that for opaque elements rendering behind them is not prolonged unnecessarily
 * the gui should have similar options like css image background cover contain
 * TODO render with ortho camera
 * - https://stackoverflow.com/questions/48758959/what-is-required-to-convert-threejs-perspective-camera-to-orthographic
 */

AFRAME.registerComponent('hud-hud', {
  // dependencies:["camera"],
  schema: {
    defaultLight: {type: 'boolean', default: true},
    height: {type: 'number', default: 1},
    width: {type: 'number', default: 1},
    size: {type: 'string', default: 'contain', oneOf: ['contain', 'cover']}
    // TODO aspect
  },

  init: function () {
    // hide from default render pass
    this.el.setAttribute('visible', false);

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
  renderHUD: function () {
    let ac = this.mRenderer.autoClear;

    this.mRenderer.autoClear = false; // important!
    // TODO prevent matrix updates if unnecessary

    this.mRenderer.clearDepth(); // important! clear the depth buffer

    var camera = this.el.sceneEl.camera;

    this.el.object3D.visible = true;

    this.mRenderer.render(undefined, this.mScene, camera);

    this.el.object3D.visible = false;

    this.mRenderer.autoClear = ac; // restore auto clear value
  },
  resizeHUD: function () {
    // TOD we only need to listen to resize events
    let camera = this.el.sceneEl.camera;
    let zDepth;

    if (this.data.size == 'contain') {
      zDepth = camera.aspect > 1 ? zDepthForHeight(this.data.height, camera) : zDepthForWidth(this.data.width, camera);
    } else if (this.data.size == 'cover') {
      zDepth = camera.aspect > 1 ? zDepthForWidth(this.data.width, camera) : zDepthForHeight(this.data.height, camera);
    } else console.warn("'size' unknown property:", this.data.size);

    // let zDepth = zDepthForHeight(this.data.height, camera);
    // let zDepth = zDepthForWidth(this.data.width, camera);
    // console.log('zDepthForHeight', zDepth);
    this.el.object3D.position.z = -zDepth; /// camera.aspect;
  }
});

/**
 * Injects THREE::Renderer.render with event emitters for before-render and after-render
 * which the user can start listening to.
 *
 */

AFRAME.registerComponent('renderer-listener', {
  dependencies: ['renderer'],
  schema: {},
  init: function () {
    this.mRenderer = this.el.sceneEl.renderer;

    if (this.mRenderer.__renderer_listener__) {
      console.warn('already attached');
      return;
    }

    let renderFunction = this.mRenderer.render;

    /**
         *
         * @param token - a token to distinguish between normal render pass and our second
         *
         * @param args - the usual render parameters of the renderer ( scene, camera, renderTarget, forceClear)
         */
    var that = this;
    this.mRenderer.render = function (token, ...args) {
      var res;
      if (token instanceof THREE.Scene) {
        that.el.emit('before-render');
        res = renderFunction.call(this, token, ...args);
        that.el.emit('after-render');
      } else {
        // handle second render pass without emitting events
        res = renderFunction.call(this, ...args);
      }

      return res;
    };

    this.mRenderer.__renderer_listener__ = true;
  }
});

AFRAME.registerComponent('gui-border', {
  schema: {},
  init: function () {
    // wireframe
    let mesh = this.el.object3DMap.mesh;

    if (!mesh) {
      console.error('mesh for border not found');
      return;
    }

    var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
    var wireframe = new THREE.LineSegments(geo, mat);
    this.el.setObject3D('mesh-border', wireframe);
    mesh.add(wireframe);
  },
  remove: function () {
    this.el.removeObject3D('mesh-border');
  }
});
