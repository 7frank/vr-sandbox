
import 'three.terrain.js/build/THREE.Terrain.min.js';
import * as _ from 'lodash';

/**
 * creates a procedural terrain
 *
 *
 */
export
function createTerrain (xS = 64, yS = 64, xSize = 1024, ySize = 1024, minHeight = -100, maxHeight = 100, material) {
  xS--; yS--;

  // -----------------------

  if (!material) { material = new THREE.MeshBasicMaterial({color: 0x5566aa}); }
  // -----------------------

  let options = {
    easing: THREE.Terrain.Linear,
    frequency: 2.5,
    heightmap: THREE.Terrain.DiamondSquare,
    material,
    maxHeight: maxHeight,
    minHeight: minHeight,
    steps: 1,
    useBufferGeometry: false,
    xSegments: xS,
    xSize,
    ySegments: yS,
    ySize

  };

  var terrainScene = THREE.Terrain(options);
  // Assuming you already have your global scene
  // terrainScene.scale.set(0.1, 0.1, 0.1);

  // storea copy of the heightmap data for z-pos querying
  terrainScene.data = {heightmap2d: function () { return THREE.Terrain.toArray2D(terrainScene.children[0].geometry.vertices, options); }, heightmap1d: function () { return THREE.Terrain.toArray1D(terrainScene.children[0].geometry.vertices, options); }, factory: THREE.Terrain, options};

  // scene.add(terrainScene);

  return terrainScene;
}

// FIXME scattering different objects on the map will greatly increase versatility
// TODO probably have a separate component for scattering any objects the user wants

/*

 var geo = buildTree();

// Add randomly distributed foliage
var decoScene = THREE.Terrain.ScatterMeshes(geo, {
  mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
  w: xS,
  h: yS,
  spread: 0.02,
  randomness: Math.random
});
terrainScene.add(decoScene);
*/
export
function buildTree () {
  var material = [
    new THREE.MeshLambertMaterial({ color: 0x3d2817 }), // brown
    new THREE.MeshLambertMaterial({ color: 0x2d4c1e }) // green
  ];

  var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, true));
  c0.position.y = 6;
  var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
  c1.position.y = 18;
  var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
  c2.position.y = 25;
  var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
  c3.position.y = 32;

  var g = new THREE.Geometry();
  c0.updateMatrix();
  c1.updateMatrix();
  c2.updateMatrix();
  c3.updateMatrix();
  g.merge(c0.geometry, c0.matrix);
  g.merge(c1.geometry, c1.matrix);
  g.merge(c2.geometry, c2.matrix);
  g.merge(c3.geometry, c3.matrix);

  var b = c0.geometry.faces.length;
  for (var i = 0, l = g.faces.length; i < l; i++) {
    g.faces[i].materialIndex = i < b ? 0 : 1;
  }

  var m = new THREE.Mesh(g, material);

  m.scale.x = m.scale.z = 5;
  m.scale.y = 1.25;
  return m;
}

/**
 * copy of THREE.Terrain.generateBlendedMaterial with changes to uniforms because of errors thrown.
 * @deprecated will be removed as soon as AFRAME supports THREE rev. 91
 * @param textures
 * @returns {THREE.ShaderMaterial}
 */

if (parseInt(THREE.REVISION) > 90) throw new Error('refactor and use THREE.Terrain.generateBlendedMaterial');
export
function generateBlendedMaterial (textures) {
  // Convert numbers to strings of floats so GLSL doesn't barf on "1" instead of "1.0"
  function glslifyNumber (n) {
    return n === (n | 0) ? n + '.0' : n + '';
  }

  var uniforms = THREE.UniformsUtils.merge([THREE.ShaderLib.lambert.uniforms]),
    declare = '',
    assign = '',
    t0Repeat = textures[0].texture.repeat,
    t0Offset = textures[0].texture.offset;
  for (var i = 0, l = textures.length; i < l; i++) {
    // Uniforms
    textures[i].texture.wrapS = textures[i].wrapT = THREE.RepeatWrapping;
    textures[i].texture.needsUpdate = true;
    uniforms['texture_' + i] = {
      type: 't',
      value: textures[i].texture
    };

    // Shader fragments
    // Declare each texture, then mix them together.
    declare += 'uniform sampler2D texture_' + i + ';\n';
    if (i !== 0) {
      var v = textures[i].levels, // Vertex heights at which to blend textures in and out
        p = textures[i].glsl, // Or specify a GLSL expression that evaluates to a float between 0.0 and 1.0 indicating how opaque the texture should be at this texel
        useLevels = typeof v !== 'undefined', // Use levels if they exist; otherwise, use the GLSL expression
        tiRepeat = textures[i].texture.repeat,
        tiOffset = textures[i].texture.offset;
      if (useLevels) {
        // Must fade in; can't start and stop at the same point.
        // So, if levels are too close, move one of them slightly.
        if (v[1] - v[0] < 1) v[0] -= 1;
        if (v[3] - v[2] < 1) v[3] += 1;
        for (var j = 0; j < v.length; j++) {
          v[j] = glslifyNumber(v[j]);
        }
      }
      // The transparency of the new texture when it is layered on top of the existing color at this texel is
      // (how far between the start-blending-in and fully-blended-in levels the current vertex is) +
      // (how far between the start-blending-out and fully-blended-out levels the current vertex is)
      // So the opacity is 1.0 minus that.
      var blendAmount = !useLevels ? p
        : '1.0 - smoothstep(' + v[0] + ', ' + v[1] + ', vPosition.z) + smoothstep(' + v[2] + ', ' + v[3] + ', vPosition.z)';
      assign += '        color = mix( ' +
                'texture2D( texture_' + i + ', MyvUv * vec2( ' + glslifyNumber(tiRepeat.x) + ', ' + glslifyNumber(tiRepeat.y) + ' ) + vec2( ' + glslifyNumber(tiOffset.x) + ', ' + glslifyNumber(tiOffset.y) + ' ) ), ' +
                'color, ' +
                'max(min(' + blendAmount + ', 1.0), 0.0)' +
                ');\n';
    }
  }

  var params = {
    // I don't know which of these properties have any effect
    fog: true,
    lights: true,
    // shading: THREE.SmoothShading,
    // blending: THREE.NormalBlending,
    // depthTest: <bool>,
    // depthWrite: <bool>,
    // wireframe: false,
    // wireframeLinewidth: 1,
    // vertexColors: THREE.NoColors,
    // skinning: <bool>,
    // morphTargets: <bool>,
    // morphNormals: <bool>,
    // opacity: 1.0,
    // transparent: <bool>,
    // side: THREE.FrontSide,

    uniforms: uniforms,
    vertexShader: THREE.ShaderLib.lambert.vertexShader.replace(
      'void main() {',
      'varying vec2 MyvUv;\nvarying vec3 vPosition;\nvarying vec3 myNormal; void main() {\nMyvUv = uv;\nvPosition = position;\nmyNormal = normal;'
    ),
    // This is mostly copied from THREE.ShaderLib.lambert.fragmentShader
    fragmentShader: [
      'uniform vec3 diffuse;',
      'uniform vec3 emissive;',
      'uniform float opacity;',
      'varying vec3 vLightFront;',
      '#ifdef DOUBLE_SIDED',
      '    varying vec3 vLightBack;',
      '#endif',

      THREE.ShaderChunk.common,
      THREE.ShaderChunk.packing,
      THREE.ShaderChunk.dithering_pars_fragment,
      THREE.ShaderChunk.color_pars_fragment,
      THREE.ShaderChunk.uv_pars_fragment,
      THREE.ShaderChunk.uv2_pars_fragment,
      THREE.ShaderChunk.map_pars_fragment,
      THREE.ShaderChunk.alphamap_pars_fragment,
      THREE.ShaderChunk.aomap_pars_fragment,
      THREE.ShaderChunk.lightmap_pars_fragment,
      THREE.ShaderChunk.emissivemap_pars_fragment,
      THREE.ShaderChunk.envmap_pars_fragment,
      THREE.ShaderChunk.bsdfs,
      THREE.ShaderChunk.lights_pars,
      // THREE.ShaderChunk.lights_pars_begin,
      // THREE.ShaderChunk.lights_pars_maps,
      THREE.ShaderChunk.fog_pars_fragment,
      THREE.ShaderChunk.shadowmap_pars_fragment,
      THREE.ShaderChunk.shadowmask_pars_fragment,
      THREE.ShaderChunk.specularmap_pars_fragment,
      THREE.ShaderChunk.logdepthbuf_pars_fragment,
      THREE.ShaderChunk.clipping_planes_pars_fragment,

      declare,
      'varying vec2 MyvUv;',
      'varying vec3 vPosition;',
      'varying vec3 myNormal;',

      'void main() {',

      THREE.ShaderChunk.clipping_planes_fragment,

      'ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );',
      'vec3 totalEmissiveRadiance = emissive;',

      // TODO: The second vector here is the object's "up" vector. Ideally we'd just pass it in directly.
      'float slope = acos(max(min(dot(myNormal, vec3(0.0, 0.0, 1.0)), 1.0), -1.0));',

      '    vec4 diffuseColor = vec4( diffuse, opacity );',
      '    vec4 color = texture2D( texture_0, MyvUv * vec2( ' + glslifyNumber(t0Repeat.x) + ', ' + glslifyNumber(t0Repeat.y) + ' ) + vec2( ' + glslifyNumber(t0Offset.x) + ', ' + glslifyNumber(t0Offset.y) + ' ) ); // base',
      assign,
      '    diffuseColor = color;',
      // '    gl_FragColor = color;',

      THREE.ShaderChunk.logdepthbuf_fragment,
      THREE.ShaderChunk.map_fragment,
      THREE.ShaderChunk.color_fragment,
      THREE.ShaderChunk.alphamap_fragment,
      THREE.ShaderChunk.alphatest_fragment,
      THREE.ShaderChunk.specularmap_fragment,
      THREE.ShaderChunk.emissivemap_fragment,

      // accumulation
      '   reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );',

      THREE.ShaderChunk.lightmap_fragment,

      '    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );',
      '    #ifdef DOUBLE_SIDED',
      '            reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;',
      '    #else',
      '            reflectedLight.directDiffuse = vLightFront;',
      '    #endif',
      '    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();',

      // modulation
      THREE.ShaderChunk.aomap_fragment,
      '   vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;',
      THREE.ShaderChunk.normal_flip,
      THREE.ShaderChunk.envmap_fragment,
      '   gl_FragColor = vec4( outgoingLight, diffuseColor.a );', // This will probably change in future three.js releases
      THREE.ShaderChunk.tonemapping_fragment,
      THREE.ShaderChunk.encodings_fragment,
      THREE.ShaderChunk.fog_fragment,
      THREE.ShaderChunk.premultiplied_alpha_fragment,
      THREE.ShaderChunk.dithering_fragment,
      '}'
    ].join('\n')
  };
  return new THREE.ShaderMaterial(params);
}
