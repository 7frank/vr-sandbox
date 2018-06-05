import {createTerrain, generateBlendedMaterial} from '../utils/terrain-utils';
import {updateHotComponent} from '../utils/aframe-debug-utils';
import {getWorldDirection, getWorldPosition, getWorldQuaternion, restartPhysics, toast} from '../utils/aframe-utils';
import {getPlayer} from '../game-utils';
import * as _ from 'lodash';
import {Box3Ext} from '../three/Box3Ext';

/**
 *  A terrain generator
 *  Note: might be used to generate terrain data which will be used for <cdlod-terrain> later
 */
updateHotComponent('procedural-terrain');
AFRAME.registerComponent('procedural-terrain', {
  schema: {},
  init: function () {
    console.log('procedural-terrain');

    let sampleMaterial = this.createSampleMaterial();
    // ------------------------

    let width = 64;
    let height = 64;
    let minHeight = 0;
    let maxHeight = 10;

    var mesh = createTerrain(width, height, 50, 50, minHeight, maxHeight, sampleMaterial);

    // r - altitude, g - lighting (also wind noise atm.), b - noise(delta-height of grass),
    this.createDataTexture = function () {
      let size = width * height;
      let maxMin = maxHeight - minHeight;

      var heightMap = mesh.data.heightmap1d();
      var dataRaw = _.map(heightMap, function (v) { return new THREE.Color((v - minHeight) / maxMin, _.random(0, 64) / 255, Math.random(), 1); });

      // ---------

      var data = new Uint8Array(3 * size);
      for (var i = 0; i < size; i++) {
        let color = dataRaw[i];
        var r = Math.floor(color.r * 255);
        var g = Math.floor(color.g * 255);
        var b = Math.floor(color.b * 255);

        var stride = i * 3;

        data[ stride ] = r;
        data[ stride + 1 ] = g;
        data[ stride + 2 ] = b;
      }

      // ---------
      let texture = new THREE.DataTexture(data, 64, 64, THREE.RGBFormat);
      texture.needsUpdate = true;
      return texture;
    };

    this.el.setObject3D('mesh', mesh, mesh.data);

    // create a aabb boundingbox in world coordinates for position testing
    var box = new Box3Ext();
    box.setFromObject(this.el.object3D, null, true, true);
    this.bb = box;
  },
  createSampleMaterial: function () {
    // ------------------------
    // query the dom for some materials
    var textures0 = AFRAME.nk.querySelectorAll(this.el.sceneEl, ':where(material-map-image)').map(m => m.material.clone().map);
    var textures = _.uniq(textures0, 'image');
    var [ t1, t2, t3, t4 ] = textures;

    console.log(textures);

    if (textures.length < 4) return null;

    var material = generateBlendedMaterial([
      // The first texture is the base; other textures are blended in on top.
      {texture: t1},
      // Start blending in at height -80; opaque between -35 and 20; blend out by 50
      {texture: t2, levels: [-40, -17, 10, 25]},
      {texture: t3, levels: [10, 25, 30, 42]},
      // How quickly this texture is blended in depends on its x-position.
      {
        texture: t4,
        glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'
      },
      // Use this texture if the slope is between 27 and 45 degrees
      {
        texture: t3,
        glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'
      }
    ]);

    return material;
  },
  tick: function (time, timeDelta) {
    this.putPlayerOnHeightMap();
  },
  putPlayerOnHeightMap: function () {
    let hm = this.el.getObject3D('mesh').data;

    var heightmap2d = hm.heightmap2d();

    // let posEl = getWorldPosition(this.el.object3D);

    let pos = getWorldPosition(getPlayer().object3D);

    // pos.add(posEl.clone().sub(pos));

    // let pos = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);

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

      // FIXME add offset of this.el to calculations
      y += 10;

      getPlayer().object3D.position.y = y;
    }
  }

});
