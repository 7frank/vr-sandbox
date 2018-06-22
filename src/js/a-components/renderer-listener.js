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
         *  Note: if the first param (the scene) contains an attribute __suppress_render_events__ == true no additional events are emitted.. this can be use to create a render pass that listeners may wait for
         * @param args - the usual render parameters of the renderer ( scene, camera, renderTarget, forceClear)
         */
    var that = this;
    this.mRenderer.render = function (...args) {
      let token = args[0].__suppress_render_events__;

      var res;
      if (token) {
        res = renderFunction.call(this, ...args);
      } else {
        // handle second render pass without emitting events
        that.el.emit('before-render', args);
        res = renderFunction.call(this, ...args);
        that.el.emit('after-render', args);
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
