import {updateHotComponent} from '../../utils/aframe-debug-utils';
import {createMesh, update} from './lib/sj-terra-gras';
import grassVertexShader from './shader/grass.vert.glsl';
import grassFragmentShader from './shader/grass.frag.glsl';
import * as _ from 'lodash';
import {getWorldPosition, getWorldDirection, getWorldQuaternion, loadTexture} from '../../utils/aframe-utils';
import {getPlayer} from '../../game-utils';
import {FPSCtrl} from '../../utils/fps-utils';

import grassImage from './assets/grass.jpg';

/**
 * Grass that can be used on a terrain
 // FIXME  height of blades should be parametrizable
 // FIXME and density should depend on angle (looking in the distance == foreground more blades to render )
 // looking on the ground equal amount rendered
 */
updateHotComponent('simple-grass');
AFRAME.registerComponent('simple-grass', {
  dependencies: ['procedural-terrain'],
  schema: {},
  init: function () {
    this.el.addEventListener('terrain-model-loaded', this.initGrass.bind(this));
  },
  initGrass: async function () {
    let texture = await loadTexture(grassImage);

    let mProcTerrain = this.el.components['procedural-terrain'];

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
    let grassPatchRadius = 20;

    let terrainDimensions = mProcTerrain.dimensions;

    /**
         *
         * @type {THREE.Vector3}
         */
    const heightMapScale = new THREE.Vector3(
      1.0 / terrainDimensions.xSize,
      1.0 / terrainDimensions.ySize,
      terrainDimensions.maxHeight - terrainDimensions.minHeight
    );

    let terrainDataTexture = mProcTerrain.createDataTexture();

    let grassMesh = this.generateGrassPatch(texture, terrainDataTexture, heightMapScale, numGrassBlades, grassPatchRadius);

    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.raycast = function () {
    }; // override raycast

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

      const elPos = getWorldPosition(this.el.object3D);

      ppos.sub(elPos);

      // only for directional sun light computation in shader
      const pdir = getWorldDirection(getPlayer().object3D);// player.state.dir

      let rotation = getPlayer().object3D.getWorldRotation();

      let a = pdir.length();

      const pyaw = rotation.y + Math.PI / 2;// rot2.z * 2; // rotation.z + Math.PI / 2;// player.state.yaw
      const ppitch = rotation.x; // player.state.pitch
      const proll = rotation.z; // player.state.roll

      // Update grass.
      // Here we specify the centre position of the square patch to
      // be drawn. That would be directly in front of the camera, the
      // distance from centre to edge of the patch.

      let alteredDistance = 1;

      if (ppitch < 1) {
        alteredDistance = (ppitch + 1) / 2;
      }

      // FIXME rotation yaw != euler.z
      drawPos.set(
        ppos.x +
                Math.cos(pyaw) * grassPatchRadius * alteredDistance,
        -ppos.z +
                Math.sin(pyaw) * grassPatchRadius * alteredDistance
      );

      // ------------------------------------------------

      /* function transform (vec, str = 'xyz') {
                    let res = _.map(str.split(''), function (v) { return vec[v]; });
                    return new THREE.Vector3(...res);
                  }
                  */
      //   update(grassMesh, info.time * 0.001, undefined /* transform(ppos, window.order1) */, transform(pdir,"xyz"), drawPos);

      update(grassMesh, info.time * 0.001, undefined /* transform(ppos, window.order1) */, pdir, drawPos);
    }, this).start();
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

    // where height based fade out of gras start and where does it end
    const BEACH_TRANSITION_LOW = 0.01;
    const BEACH_TRANSITION_HIGH = 0.02;

    const WIND_DEFAULT = 0.15;
    const WIND_MAX = 0.3;

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
      windIntensity: windIntensity,
      BLADE_WIDTH: 0.04,
      BLADE_HEIGHT_MIN: 0.1,
      BLADE_HEIGHT_MAX: 0.15
    });

    return grassMesh;
  }

});
