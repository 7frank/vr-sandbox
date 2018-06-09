
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
  schema: {color: {default: '#FFF'}, opacity: {default: 1}},
  init: function () {
    // wireframe
    let mesh = this.el.object3DMap.mesh;

    if (!mesh) {
      console.error('mesh for border not found');
      return;
    }

    var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({color: new THREE.Color(this.data.color), linewidth: 2});
    if (this.data.opacity < 1) mat.transparent = true;
    mat.opacity = this.data.opacity;

    var wireframe = new THREE.LineSegments(geo, mat);
    this.el.setObject3D('mesh-border', wireframe);
    mesh.add(wireframe);
  },
  remove: function () {
    this.el.removeObject3D('mesh-border');
  }
});
