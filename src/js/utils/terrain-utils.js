
import 'three.terrain.js/build/THREE.Terrain.min.js';

/**
 * creates a procedural terrain
 *
 *
 */
export
function createTerrain (xS = 64, yS = 64, minHeight = -100, maxHeight = 100) {
  xS--; yS--;

  var terrainScene = THREE.Terrain({
    easing: THREE.Terrain.Linear,
    frequency: 2.5,
    heightmap: THREE.Terrain.DiamondSquare,
    material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
    maxHeight: maxHeight,
    minHeight: minHeight,
    steps: 1,
    useBufferGeometry: false,
    xSegments: xS,
    xSize: 1024,
    ySegments: yS,
    ySize: 1024
  });
    // Assuming you already have your global scene
  terrainScene.scale.set(0.1, 0.1, 0.1);

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
