import {createTerrain} from '../../utils/terrain-utils';
import {Terrain} from './lod-terrain-index';
import {ImprovedNoise} from './PerlinNoise';
import {updateHotComponent} from '../../utils/aframe-utils';
import {FPSCtrl} from '../../util';

function toArray2D (vertices, options) {
  var tgt = new Array(options.xSegments),
    xl = options.xSegments + 1,
    yl = options.ySegments + 1,
    i, j;
  for (i = 0; i < xl; i++) {
    tgt[i] = new Float64Array(options.ySegments);
    for (j = 0; j < yl; j++) {
      tgt[i][j] = vertices[j * xl + i].z;
    }
  }
  return tgt;
}

function toArray1D (vertices) {
  var tgt = new Float64Array(vertices.length);
  for (var i = 0, l = tgt.length; i < l; i++) {
    tgt[i] = vertices[i].z;
  }
  return tgt;
}

function toArray1DTex (vertices) {
  var tgt = new Uint8Array(vertices.length * 3);
  for (var i = 0, l = vertices.length; i < l; i += 3) {
    tgt[i] = vertices[i].z;
    tgt[i + 1] = vertices[i].z;
    tgt[i + 2] = vertices[i].z;
  }
  return tgt;
}

function createNoise (width, height, zScale = 100) {
  // Create noise and save it to texture
  // Create noise and save it to texture
  var size = width * height;
  var data = new Uint8Array(size);

  // Zero out height data
  for (var i = 0; i < size; i++) {
    data[i] = 0;
  }

  var perlin = new ImprovedNoise();
  var quality = 1;
  var z = Math.random() * zScale;

  // Do several passes to get more detail
  for (var iteration = 0; iteration < 4; iteration++) {
    for (var i = 0; i < size; i++) {
      var x = i % width;
      var y = Math.floor(i / height);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality);
    }
    quality *= 5;
  }

  var noise = new THREE.DataTexture(data, width, width, THREE.AlphaFormat);
  noise.wrapS = THREE.MirroredRepeatWrapping;// THREE.ClampToEdgeWrapping; //
  noise.wrapT = THREE.MirroredRepeatWrapping;// THREE.ClampToEdgeWrapping;//
  noise.needsUpdate = true;
  return noise;
}

function createFromTerrain (terrainMesh, width, height, zScale = 100) {
  var vertices = terrainMesh.children[0].geometry.vertices;
  // Create noise and save it to texture
  // Create noise and save it to texture
  var size = width * height;
  var data = new Uint8Array(size);

  // Zero out height data
  for (var i = 0; i < size; i++) {
    data[i] = vertices[i].z * zScale;
  }

  var noise = new THREE.DataTexture(data, width, width, THREE.AlphaFormat);
  noise.wrapS = THREE.MirroredRepeatWrapping;// THREE.ClampToEdgeWrapping; //
  noise.wrapT = THREE.MirroredRepeatWrapping;// THREE.ClampToEdgeWrapping;//
  noise.needsUpdate = true;
  return noise;
}

/**
 * based on the code it might not be a cdlod but rather parts of its implementation
 *  TODO see {link http://www.vertexasylum.com/downloads/cdlod/cdlod_latest.pdf} for implementation details and compare them
 * TODO check out http://www.zephyrosanemos.com/windstorm/current/live-demo.html
 */
updateHotComponent('cdlod-terrain');
AFRAME.registerComponent('cdlod-terrain', {
  schema: {
    width: {type: 'number', default: 64}

  },
  init: function () {
    var worldWidth = this.data.width, worldDepth = worldWidth, worldHeight = worldWidth / 10, levels = 6, resolution = worldWidth / 8;
    // var size = worldWidth * worldDepth;

    var proceduralTerrainMesh = createTerrain(worldWidth, worldDepth, 0, worldHeight);

    // var data = createNoise(worldWidth, worldDepth, worldWidth / 10);
    var data = createFromTerrain(proceduralTerrainMesh, worldWidth, worldDepth, worldHeight);

    var mesh = new Terrain(data, worldWidth, levels, resolution);

    this.followCameraScript = new FPSCtrl(30, function () {
      var camPos = this.el.sceneEl.camera.el.object3D.getWorldPosition();

      var mPos = mesh.getWorldPosition();

      mPos.sub(camPos);

      mesh.offset.set(mPos.x, mPos.z, mPos.y);
    }, this).start();

    this.el.setObject3D('mesh', mesh);
  },
  remove: function () {
    this.el.removeObject3D('mesh');
    this.followCameraScript.pause();
  },
  tick: function (time, timeDelta) {
    // var mesh = this.el.getObject3D('mesh)'
  }

});
