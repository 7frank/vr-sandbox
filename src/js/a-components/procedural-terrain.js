import {createTerrain, generateBlendedMaterial} from '../utils/terrain-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';
import {
  getWorldDirection, getWorldPosition, getWorldQuaternion, loadTexture, restartPhysics,
  toast
} from '../utils/aframe-utils';
import {getPlayer} from '../game-utils';
import * as _ from 'lodash';
import {Box3Ext} from '../three/Box3Ext';
import grassImage from './a-grass/assets/terrain-gras.jpg';
import dirtImage from './a-grass/assets/terrain-dirt.jpg';
/**
 *  A terrain generator
 *  Note: might be used to generate terrain data which will be used for <cdlod-terrain> later
 */
updateHotComponent('procedural-terrain');
AFRAME.registerComponent('procedural-terrain', {
  schema: {},
  init: async function () {
    console.log('procedural-terrain');

    let xSize = 100;
    let ySize = 100;

    let sampleMaterial = await this.createSampleMaterial(xSize, ySize);
    // ------------------------

    let xSegments = 64;
    let ySegments = 64;
    let minHeight = 0;
    let maxHeight = 5;

    var mesh = createTerrain(xSegments, ySegments, xSize, ySize, minHeight, maxHeight, sampleMaterial);

    this.dimensions = mesh.data.dimensions;

    window.terrainMesh = mesh.children[0];

    // r - altitude, g - lighting (also wind noise atm.), b - noise(delta-height of grass),
    this.createDataTexture = function () {
      let size = xSegments * ySegments;
      let maxMin = maxHeight - minHeight;

      var heightMap = mesh.data.heightmap1d();

      var dataRaw = _.map(heightMap, function (v) {
        return new THREE.Vector4(
          (v - minHeight) / maxMin, // height data
          _.random(0, 64) / 255, // wind per blade
          _.random(150, 255) / 255, // blade height offset (use noise to alter height a bit)
          _.random(200, 255) / 255); // light data (the more the highter)
      });

      // ---------

      var data = new Uint8Array(4 * size);
      for (var i = 0; i < size; i++) {
        let color = dataRaw[i];
        var r = Math.floor(color.x * 255);
        var g = Math.floor(color.y * 255);
        var b = Math.floor(color.z * 255);
        var a = Math.floor(color.w * 255);
        var stride = i * 4;

        data[ stride ] = r;
        data[ stride + 1 ] = g;
        data[ stride + 2 ] = b;
        data[ stride + 3 ] = a;
      }

      // ---------
      let texture = new THREE.DataTexture(data, 64, 64, THREE.RGBAFormat);
      texture.needsUpdate = true;

      return texture;
    };

    this.el.setObject3D('terrain-mesh', mesh, mesh.data);

    // create a aabb boundingbox in world coordinates for position testing
    var box = new Box3Ext();
    box.setFromObject(this.el.object3D, null, true, true);
    this.bb = box;

    //
    this.el.emit('terrain-model-loaded');
  },
  createSampleMaterial: async function (xSize, ySize) {
    // ------------------------
    // query the dom for some materials
    /*    var textures0 = AFRAME.nk.querySelectorAll(this.el.sceneEl, ':where(material-map-image)').map(m => m.material.clone().map);
    var textures = _.uniq(textures0, 'image');
    var [ t1, t2, t3, t4 ] = textures;

    if (textures.length < 4) return null;
*/

    let textureGrass = await loadTexture(grassImage);
    window.textureGrass = textureGrass;
    textureGrass.repeat.set(xSize / 10, ySize / 10);
    textureGrass.wrapS = THREE.RepeatWrapping;
    textureGrass.wrapT = THREE.RepeatWrapping;

    let textureDirt = await loadTexture(dirtImage);

    var material = generateBlendedMaterial([
      // The first texture is the base; other textures are blended in on top.
      {texture: textureDirt},
      // Start blending in at height -80; opaque between -35 and 20; blend out by 50
      {texture: textureGrass, levels: [-40, -17, 10, 25]},
      {texture: textureDirt, // t3
        levels: [10, 25, 30, 42]},
      // How quickly this texture is blended in depends on its x-position.
      {
        texture: textureDirt, // t4
        glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'
      },
      // Use this texture if the slope is between 27 and 45 degrees
      {
        texture: textureDirt, // t3
        glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'
      }
    ]);

    return material;
  },
  tick: function (time, timeDelta) {
    this.putPlayerOnHeightMap();
  },
  putPlayerOnHeightMap: function () {
    if (!this.el.getObject3D('terrain-mesh')) return;

    let hm = this.el.getObject3D('terrain-mesh').data;

    var heightmap2d = hm.heightmap2d();

    // let posEl = getWorldPosition(this.el.object3D);

    let pos = getWorldPosition(getPlayer().object3D);

    // pos.add(posEl.clone().sub(pos));

    // let pos = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);

    if (!this.bb) { console.error('boundingbox not defined', this); return; }

    let pctX = (pos.x - this.bb.min.x) / (this.bb.max.x - this.bb.min.x);
    let pctY = (pos.z - this.bb.min.z) / (this.bb.max.z - this.bb.min.z);
    let px = pctX * hm.options.xSegments;
    let py = pctY * hm.options.ySegments;

    if (this.bb.min.x < pos.x && this.bb.max.x > pos.x && this.bb.min.z < pos.z && this.bb.max.z > pos.z) {
      // interpolate x and y positions

      var direction = getWorldDirection(getPlayer().object3D);

      let baseY = _.get(heightmap2d, `[${parseInt(px)}][${parseInt(py)}]`, 0);
      let baseY_x = _.get(heightmap2d, `[${parseInt(px + direction.x)}][${parseInt(py)}]`, 0);
      let baseY_y = _.get(heightmap2d, `[${parseInt(px)}][${parseInt(py + direction.y)}]`, 0);

      let dx = (baseY_x - baseY) * (px % 1);
      let dy = (baseY_y - baseY) * (py % 1);
      let y = baseY + (dx + dy) / 2;

      // scale by mesh size
      y *= (this.bb.max.y - this.bb.min.y) / (hm.options.maxHeight - hm.options.minHeight);
      // add average player eye height/size
      y += 1.6;

      //
      y += this.el.object3D.position.y;

      // TODO remove after blade size is a parameter
      //  y += 7;

      getPlayer().object3D.position.y = y;
    }
  }

});
