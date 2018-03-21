
/**
 * creates a axis aligned bounding box (aabb) for a entity it is attached to
 *
 * Example:
 * <a-sphere bb ></a-sphere>
 *
 *
 *TODO
 have a ring menu around a-form
 for vr have 2. modi one free roaming and one where the ringmenu
 is usable via laserpointer and where elements can be dragged? from vr-item-list

 make use of keyboard component and input

 *
 */

AFRAME.registerComponent('code-editor', {
  init: function () {
    setTimeout(function handler (event) {
      if (!THREE.CodeEditor) {
        console.warn('THREE.CodeEditor pending...');
        this.init();
      } else { this.initAsync(); }
    }.bind(this), 500);
  },

  initAsync: function () {
    var obj = this.el.getObject3D('mesh') || this.el.object3D;

    if (!obj) console.error('no obj defined for bbox helper');

    var sceneEl = this.el.sceneEl;

    var cam = sceneEl.camera;
    // set up editor
    var codeEditor = this.editor = new THREE.CodeEditor({
      domElement: sceneEl.renderer.domElement, // renderer.domElement,
      camera: cam
    });
    // sceneEl.object3D.add(codeEditor);

    this.el.setObject3D('mesh', codeEditor);

    codeEditor.alignWithCamera('center', cam);
    codeEditor.setValue('Hello World :)');
  }

});
