
/**
 * A component for rendering a transparent cube when editing content. showcasing
 * TODO reuse other components like geometry cube?
 */

AFRAME.registerComponent('dotted-cube', {
  schema: {
    dimensions: {
      type: 'string',
      default: '50 50 50'
    }

  },
  init: function () {
    let {x, y, z} = AFRAME.utils.coordinates.parse(this.data.dimensions);

    var cubeGeometry = new THREE.CubeGeometry(x, y, z);

    // use LineBasicMaterial if no dashes are desired
    var dashMaterial = new THREE.LineDashedMaterial({color: 0xFFFFFF, dashSize: 1, gapSize: 1.5, linewidth: 1});

    var eGeometry = new THREE.EdgesGeometry(cubeGeometry);

    var edges = new THREE.LineSegments(eGeometry, dashMaterial);
    edges.computeLineDistances();

    var material1 = new THREE.MeshStandardMaterial({
      opacity: 0.2,
      transparent: true,
      side: THREE.BackSide,
      map: THREE.ImageUtils.loadTexture('assets/images/grids/UV_Grid_Sm.jpg')
    });

    let cubemesh = new THREE.Mesh(cubeGeometry, material1);

    cubemesh.raycast = function () {};
    edges.raycast = function () {};

    this.el.setObject3D('dotted-cube-mesh-faces', cubemesh);

    this.el.setObject3D('dotted-cube-mesh-edges', edges);
  }
});
