import {HexTexture} from '../utils/HexTexture';

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

    let size = 1024;
    let radius = 64;
    let repeat = size / (radius);

    // 'assets/images/grids/UV_Grid_Sm.jpg'

    let url = (new HexTexture(size - radius, size - radius)).drawHexGrid(radius, repeat, repeat, -radius / 2, -radius / 2).getDataURL();
    let texture = THREE.ImageUtils.loadTexture(url);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;

    texture.repeat.set(1, 1);
    global.texture = texture;
    var material1 = new THREE.MeshStandardMaterial({
      opacity: 0.7,
      transparent: true,
      side: THREE.BackSide,
      map: texture
    });

    let cubemesh = new THREE.Mesh(cubeGeometry, material1);

    cubemesh.raycast = function () {
    };
    edges.raycast = function () {
    };

    this.el.setObject3D('dotted-cube-mesh-faces', cubemesh);

    this.el.setObject3D('dotted-cube-mesh-edges', edges);
  }
});
