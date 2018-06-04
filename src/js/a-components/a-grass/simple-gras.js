import {updateHotComponent} from '../../utils/aframe-debug-utils';
import {createMesh, update} from './lib/sj-terra-gras';
import grassVertexShader from './shader/grass.vert.glsl';
import grassFragmentShader from './shader/grass.frag.glsl';
import * as _ from 'lodash';
import {getWorldPosition, getWorldDirection, getWorldQuaternion} from '../../utils/aframe-utils';
import {getPlayer} from '../../game-utils';
import { FPSCtrl} from '../../utils/fps-utils';
/**
 * Grass that can be used on a terrain
 */
updateHotComponent('simple-grass');
AFRAME.registerComponent('simple-grass', {
  dependencies: ['procedural-terrain'],
  schema: {},
  init: function () {
    var textures0 = AFRAME.nk.querySelectorAll(this.el.sceneEl, ':where(material-map-image)').map(m => m.material.clone().map);
    var textures = _.uniq(textures0, 'image');
    var [t1, t2, t3, t4] = textures;

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
    let numGrassBlades = 84000;
    let grassPatchRadius = 85;

    // const HEIGHTFIELD_SIZE = 1024.0;
    // const HEIGHTFIELD_HEIGHT = 50.0;

    const HEIGHTFIELD_SIZE = 100.0;
    const HEIGHTFIELD_HEIGHT = 1.0;

    const heightMapScale = new THREE.Vector3(
      1.0 / HEIGHTFIELD_SIZE,
      1.0 / HEIGHTFIELD_SIZE,
      HEIGHTFIELD_HEIGHT
    );

    let terrainDataTexture = this.el.components['procedural-terrain'].createDataTexture();

    let grassMesh = this.generateGrassPatch(t2, terrainDataTexture, heightMapScale, numGrassBlades, grassPatchRadius);
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
      const pdir = getWorldDirection(getPlayer().object3D);// player.state.dir
      let {qx, qy, qz} = getWorldQuaternion(getPlayer().object3D);
      const pyaw = qy;// player.state.yaw
      const ppitch = qx; // player.state.pitch
      const proll = qz; // player.state.roll

      // Update grass.
      // Here we specify the centre position of the square patch to
      // be drawn. That would be directly in front of the camera, the
      // distance from centre to edge of the patch.

      drawPos.set(
        ppos.x + Math.cos(pyaw) * grassPatchRadius,
        ppos.y + Math.sin(pyaw) * grassPatchRadius
      );

      // ------------------------------------------------

      update(grassMesh, info.time * 0.001, ppos, pdir, drawPos);
    }, this).start();

    /* var loader = new THREE.TextureLoader();
                 loader.load(
                     // resource URL
                     'textures/land_ocean_ice_cloud_2048.jpg',

                     // onLoad callback
                     function ( texture ) {
                         // in this example we create the material when the texture is loaded
                         var material = new THREE.MeshBasicMaterial( {
                             map: texture
                         } );
                     },

                     // onProgress callback currently not supported
                     undefined,

                     // onError callback
                     function ( err ) {
                         console.error( 'An error happened.' );
                     }
                 ); */
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
