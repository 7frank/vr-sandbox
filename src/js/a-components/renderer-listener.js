
AFRAME.registerPrimitive('a-hud', {
  defaultComponents: {
    'hud-hud': {}
  },
  mappings: {defaultLight: 'hud-hud.defaultLight'}
});

/**
 * specialized element that waits for after-render event and renders elements on top
 * TODO (only for opaque elements)before-render and set zbuffer write to closest so that for opaque elements rendering behind them is not prolonged unnecessarily
 */

AFRAME.registerComponent('hud-hud', {
  schema: {defaultLight: {type: 'boolean', default: true}},
  init: function () {
    // hide from default render pass
    this.el.setAttribute('visible', false);

    this.mRenderer = this.el.sceneEl.renderer;

    // wait for after-render event
    this.el.sceneEl.addEventListener('after-render', this.renderHud.bind(this));

    // -----------------------------------------
    var scene = new THREE.Scene();
    // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var light = new THREE.AmbientLight(0xFFFFFF); // soft white light
    scene.add(light);

    var renderer = this.mRenderer;

    scene.add(this.el.object3D.parent);

    this.mScene = scene;
  },
  renderHud: function () {
    let ac = this.mRenderer.autoClear;

    this.mRenderer.autoClear = false; // important!
    // TODO prevent matrix updates if unnecessary

    this.mRenderer.clearDepth(); // important! clear the depth buffer

    var camera = this.el.sceneEl.camera;

    this.el.object3D.visible = true;

    this.mRenderer.render(undefined, this.mScene, camera);

    this.el.object3D.visible = false;

    this.mRenderer.autoClear = ac; // restore auto clear value
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

    if (this.mRenderer.__renderer_listener__) { console.warn('already attached'); return; }

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
