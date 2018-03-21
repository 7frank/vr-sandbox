/**
 * A world map implementation
 * TODO improve performance
 * we don't need to re-render all regions everytime static content can be rendered once, dynamic moving elements maybe more often
 */

import {FPSInfo, FPSCtrl} from '../utils/fps-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';
import {querySelectorAll} from '../utils/selector-utils';
import {setLayersForObject, Layers} from '../types/Layers';

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
    //  var plane = new THREE.Mesh(geometry);
    // TODO onBeforeRender .. only show static elements or similar

    var renderer = this.el.sceneEl.renderer;

    // var renderer = new THREE.WebGLRenderer();
    // renderer.setSize(512, 512);
    // document.body.appendChild(renderer.domElement);

    // ---------------------------------
    var bufferScene = new THREE.Scene();
    // FIXME improve performance of map
    bufferScene.autoUpdate = false; // this might improve performance as the matrixes already should be compiled

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

    this.el.setObject3D('map-instance', plane);

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

      renderer.render(bufferScene, camera, bufferTexture);
    }, this);

    this.updateWorldMapScript.start();
  },
  tick: function (time, timeDelta) {

  },

  remove: function () {
    this.el.removeObject3D('map-instance');
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
