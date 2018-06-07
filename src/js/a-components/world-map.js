/**
 * A world map implementation
 * TODO improve performance
 * we don't need to re-render all regions every time static content can be rendered once, dynamic moving elements maybe more often
 * -also currently every region is rendered and although only specific layers are rendered the child elements still are checked
 *
 *
 *
 *
 *
 *
 */

import {FPSInfo, FPSCtrl} from '../utils/fps-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';
import {querySelectorAll} from '../utils/selector-utils';
import {setLayersForObject, Layers} from '../types/Layers';

AFRAME.registerComponent('foreground', {
  // dependencies: ['world-map'],
  schema: {},
  init: function () {
    console.warn("deprecated: use 'a-hud' instead");

    // FIXME should work without loop
    new FPSCtrl(1, function () {
      this.update();
    }, this).start();
  },

  update: function () {
    var mesh = this.el.getObject3D('mesh');

    if (!mesh) return;

    var g = this.el.object3D;
    var m = g.children[0];
    m.material.depthTest = false;
    m.material.depthWrite = false;
  }
});

updateHotComponent('world-map');
AFRAME.registerComponent('world-map', {
  schema: {
    distanceVector: {
      type: 'vec3',
      default: {x: 0, y: 500, z: 0}

    },
    distanceScale: {
      type: 'number',
      default: 1

    }, // TODO if set to true map rotation aligns with camera rotation
    rotateWithCamera: {
      type: 'boolean',
      default: false

    }
    // rotate - rotates when player camera rotates
    // move - keeps center of map at player position
    // camera.position - camera position relative to the player
    // camera.direction - in case map is iso-45° or top view or sideways or ...

  },
  init: function () {
    // FIXME
    this.el.setAttribute('cursor-wheel-listener', true);
    // TODO
    // for now grab mouse wheel and assume that we want to scroll when map is open ...

    document.querySelector('body').addEventListener('wheel', this.onWheel.bind(this), {passive: true});

    // -----------------------------------
    // this.el.setAttribute('foreground', true);
    // -----------------------------------

    var width = 256, height = 256;

    var bufferTexture = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter
    });

    var geometry = new THREE.PlaneGeometry(10, 10);
    var material = new THREE.MeshBasicMaterial({
      map: bufferTexture.texture,
      // color: 0xffff00,
      side: THREE.DoubleSide,
      transparent: true
    });
    var plane = new THREE.Mesh(geometry, material);

    // TODO onBeforeRender .. only show static elements or similar

    var renderer = this.el.sceneEl.renderer;

    renderer.setClearColor(0x000000, 0.2);

    // var renderer = new THREE.WebGLRenderer();
    // renderer.setSize(512, 512);
    // document.body.appendChild(renderer.domElement);

    // ---------------------------------
    var bufferScene = new THREE.Scene();
    window.w = {renderer, bufferScene, material, geometry, that: this};

    // FIXME improve performance of map
    // This does not work recursivly
    // bufferScene.autoUpdate = false; // this might improve performance as the matrix already should be compiled

    var nl = document.querySelectorAll('[editable-region]');
    var arr = Array.prototype.slice.call(nl);
    arr.forEach(x => bufferScene.children.push(x.object3D));

    var origCamera = this.el.sceneEl.camera;
    var helper = new THREE.CameraHelper(origCamera);

    setLayersForObject(helper, Layers.Default, Layers.Static, Layers.Log);

    bufferScene.add(helper);
    // ---------------------------------
    var light = new THREE.AmbientLight(0x404040); // soft white light
    bufferScene.add(light);

    // ---------------------------------

    var camera = this.el.mapCam = new THREE.PerspectiveCamera(45, width / height, 1, 10000);

    setLayersForObject(camera, Layers.Static, Layers.Log);

    // TODO fix ortho camera and zoom
    // var camera = this.el.mapCam = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 10000);

    var observerPosition = new THREE.Vector3().copy(this.data.distanceVector).multiplyScalar(this.data.distanceScale).add(origCamera.position.clone());
    camera.position.copy(observerPosition);
    camera.lookAt(new THREE.Vector3(0, -1, 0));

    // add stuff here that will show up

    this.el.setObject3D('mesh', plane);

    this.updateWorldMapScript = new FPSCtrl(1, function () {
      // center map at player position
      var observerPosition = new THREE.Vector3().copy(this.data.distanceVector).multiplyScalar(this.data.distanceScale).add(origCamera.position.clone());

      camera.position.copy(observerPosition);

      helper.update();

      // TODO rotate map to align with player
      // camera.quaternion.z = origCamera.el.object3D.quaternion.z;

      // ----------------------------------
      // TODO currently only checks frustum of direct children inserted
      var frustum = new THREE.Frustum();
      frustum.setFromMatrix(new THREE.Matrix4().multiply(origCamera.projectionMatrix, origCamera.matrixWorldInverse));

      var objects = bufferScene.children; // editable-regions

      // TODO creating bbox necessary? instead we might rely only on elements that have a bbox and maybe discard others?
      for (var i = 0; i < objects.length; i++) {
        if (objects[i].boundingBox == null) {
          var box = new THREE.Box3();
          box.setFromObject(objects[i]);
          objects[i].boundingBox = box;
        }

        objects[i].visible = frustum.intersectsBox(objects[i].boundingBox);

        // FIXME objects with no bbox will not render properly
        if (objects[i] instanceof THREE.CameraHelper) objects[i].visible = true;
      }

      // ----------------------------------
      // FIXME  interference with a-hud (flickering each update)
      renderer.render(bufferScene, camera, bufferTexture);
    }, this);

    this.updateWorldMapScript.start();
  },
  tick: function (time, timeDelta) {

  },

  remove: function () {
    this.el.removeObject3D('mesh');
    this.updateWorldMapScript.pause();

    document.querySelector('body').removeEventListener('wheel', this.onWheel.bind(this));
  },
  onWheel: function (evt) {
    // scrollin/out and cap zoom at 10%/1000%
    if (evt.deltaY < 0) {
      this.data.distanceScale *= 0.9;
      if (this.data.distanceScale < 0.1) this.data.distanceScale = 0.1;
    } else if (evt.deltaY > 0) {
      this.data.distanceScale *= 1.1;
      if (this.data.distanceScale > 10) this.data.distanceScale = 10;
    }

    this.updateWorldMapScript.forceNext();
  },
  getPerformanceInfo () {
    return FPSInfo('world-map')
      .add('updateWorldMapScript', this.updateWorldMapScript)
      .compile();
  }

});
