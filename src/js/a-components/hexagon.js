import {createHexGeometry} from '../geometry/hexagon';

AFRAME.registerPrimitive('a-hexagon', {
  defaultComponents: {
    'hexagon': {}
  },
  mappings: {}
});

/**

 */

AFRAME.registerComponent('hexagon', {
  schema: {},

  init: function () {
    let geo = createHexGeometry();

    let material = new THREE.MeshStandardMaterial({metalness: 0, roughness: 0.3, color: '#222'});

    var mesh = new THREE.Mesh(geo, material);

    this.el.setObject3D('hexagon-mesh', mesh);
  }
});
