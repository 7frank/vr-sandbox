import {updateHotComponent} from '../../utils/aframe-debug-utils';
import {createMesh, update} from './lib/sj-terra-gras';
import grassVertexShader from './shader/grass.vert.glsl';
import grassFragmentShader from './shader/grass.frag.glsl';
import * as _ from 'lodash';
import {getWorldPosition, getWorldDirection, getWorldQuaternion} from '../../utils/aframe-utils';
import {getPlayer} from '../../game-utils';
import { FPSCtrl} from '../../utils/fps-utils';

import grassImage from './assets/grass.jpg';

// TODO check light direction property
window.order2 = 'xyz';

/**
 * Grass that can be used on a terrain
 */
updateHotComponent('simple-grass');
AFRAME.registerComponent('simple-grass', {
  dependencies: ['procedural-terrain'],
  schema: {},
  init: async function () {
    let texture = await this.loadGrassTexture();

    // ------------------------

    /*
          var CONFIGS = {
        mobile: { blades: 20000, depth: 50.0, antialias: false },
        laptop: { blades: 40000, depth: 65.0, antialias: false },
        desktop: { blades: 84000, depth: 85.0, antialias: true },
        desktop2: { blades: 250000, depth: 125.0, antialias: true },
        gamerig: { blades: 500000, depth: 175.0, antialias: true }
    };
           */

    // defaults from the demo for medium power laptop
    let numGrassBlades = 120000;
    let grassPatchRadius = 85;

    // const HEIGHTFIELD_SIZE = 1024.0;
    // const HEIGHTFIELD_HEIGHT = 50.0;

    const HEIGHTFIELD_SIZE = 50;
    const HEIGHTFIELD_HEIGHT = 1;

    const heightMapScale = new THREE.Vector3(
      1.0 / HEIGHTFIELD_SIZE,
      1.0 / HEIGHTFIELD_SIZE,
      HEIGHTFIELD_HEIGHT
    );

    let terrainDataTexture = this.el.components['procedural-terrain'].createDataTexture();

    let grassMesh = this.generateGrassPatch(texture, terrainDataTexture, heightMapScale, numGrassBlades, grassPatchRadius);

    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.raycast = function () {}; // override raycast

    window.grassMesh = grassMesh;
    this.el.setObject3D('grass-mesh', grassMesh);

    const drawPos = new THREE.Vector2(0.0, 0.0);
    new FPSCtrl(30, function (info) {
      // ------------------------------------------------
      // simT += dt
      // const t = simT * 0.001

      // Move player (viewer)
      // player.update(dt)
      const ppos = getWorldPosition(getPlayer().object3D);// player.state.pos
      // only for directional sun light computation in shader
      const pdir = getWorldDirection(getPlayer().object3D);// player.state.dir
      let quaternion = getWorldQuaternion(getPlayer().object3D);

      var rotation = new THREE.Euler();
      rotation.setFromRotationMatrix(getPlayer().object3D.matrix);

      let a = pdir.length();
      let rot2 = new THREE.Vector3(Math.acos(pdir.x / a), Math.acos(pdir.y / a), Math.acos(pdir.z / a));

      const pyaw = rot2.z * 2; // rotation.z + Math.PI / 2;// player.state.yaw
      // const ppitch = rotation.x; // player.state.pitch
      // const proll = rotation.z; // player.state.roll

      // console.log('rotation', _.round(rotation.x, 2), _.round(rotation.y, 2), _.round(rotation.z, 2), rot2);

      // console.log(_.round(pyaw, 2), _.round(Math.cos(pyaw) * grassPatchRadius, 2), _.round(Math.sin(pyaw) * grassPatchRadius, 2));

      // Update grass.
      // Here we specify the centre position of the square patch to
      // be drawn. That would be directly in front of the camera, the
      // distance from centre to edge of the patch.

      // FIXME rotation yaw != euler.z
      drawPos.set(
        ppos.x + Math.cos(pyaw) * grassPatchRadius,
        -ppos.z + Math.sin(pyaw) * grassPatchRadius

      );

      // ------------------------------------------------
      // FIXME the grass is not rendered in place
      // update(grassMesh, info.time * 0.001, ppos, pdir, drawPos);
      // let dp = new THREE.Vector3(drawPos.z, drawPos.y, drawPos.x);
      // let pd = new THREE.Vector3(pdir.y, pdir.x, pdir.z);

      //
      function transform (vec, str = 'xyz') {
        let res = _.map(str.split(''), function (v) { return vec[v]; });
        return new THREE.Vector3(...res);
      }

      update(grassMesh, info.time * 0.001, undefined /* transform(ppos, window.order1) */, transform(pdir, window.order2), drawPos);
    }, this).start();
  },
  loadGrassTexture: async function () {
    return new Promise(function (resolve, reject) {
      var loader = new THREE.TextureLoader();
      loader.load(
        // resource URL
        grassImage,
        // onLoad callback
        resolve,
        // onProgress callback currently not supported
        undefined,
        reject
      );
    });
  },

  /**
     *
     * @param {THREE.Texture} grasTexture - the texture for the grass blades.
     * @param {THREE.Texture} terrainTexture - a texture whose color values are interpreted as height data.
     * @param {THREE.Vector3} heightMapScale - the scaling factor of the heightmap
     * @param {number} numGrassBlades
     * @param {number} grassPatchRadius
     */
  generateGrassPatch: function (grasTexture, terrainTexture, heightMapScale, numGrassBlades, grassPatchRadius) {
    // world
    const LIGHT_DIR = new THREE.Vector3(0.0, 1.0, -1.0);
    const FOG_COLOR = new THREE.Color(0.74, 0.77, 0.91);
    const GRASS_COLOR = new THREE.Color(0.45, 0.46, 0.19);

    const BEACH_TRANSITION_LOW = 0.31;
    const BEACH_TRANSITION_HIGH = 0.36;

    const WIND_DEFAULT = 1.5;
    const WIND_MAX = 3.0;

    let windIntensity = WIND_DEFAULT;

    // ---

    const fogDist = grassPatchRadius * 20.0;
    const grassFogDist = grassPatchRadius * 2.0;

    // --

    var grassMesh = createMesh({
      lightDir: LIGHT_DIR,
      numBlades: numGrassBlades,
      radius: grassPatchRadius,
      texture: grasTexture, // assets.textures['grass'],
      vertScript: grassVertexShader(), // assets.text['grass.vert'],
      fragScript: grassFragmentShader(), // assets.text['grass.frag'],
      heightMap: terrainTexture, // terraMap,
      heightMapScale: heightMapScale,
      fogColor: FOG_COLOR,
      fogFar: fogDist,
      grassFogFar: grassFogDist,
      grassColor: GRASS_COLOR,
      transitionLow: BEACH_TRANSITION_LOW,
      transitionHigh: BEACH_TRANSITION_HIGH,
      windIntensity: windIntensity
    });

    return grassMesh;
  }

});
