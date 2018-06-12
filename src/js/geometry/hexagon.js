const TAU = Math.PI * 2;

let extrudeSettings = {
  amount: 1,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.5,
  bevelThickness: 0.5
};

export function createHexGeometry () {
  let cellShape = createBaseShape(1);
  // extrudeSettings.amount = height;
  let geo = new THREE.ExtrudeGeometry(cellShape, extrudeSettings);

  return geo;
}

// ------------------------------
function _createVertex (i, size) {
  var angle = (TAU / 6) * i;
  return new THREE.Vector3((size * Math.cos(angle)), (size * Math.sin(angle)), 0);
}

// ------------------------------
function createBaseShape (size = 1) {
// create base shape used for building geometry
  var i, verts = [];
  // create the skeleton of the hex
  for (i = 0; i < 6; i++) {
    verts.push(_createVertex(i, size));
  }
  // copy the verts into a shape for the geometry to use
  let cellShape = new THREE.Shape();
  cellShape.moveTo(verts[0].x, verts[0].y);
  for (i = 1; i < 6; i++) {
    cellShape.lineTo(verts[i].x, verts[i].y);
  }
  cellShape.lineTo(verts[0].x, verts[0].y);
  cellShape.autoClose = true;

  /*
    this.cellGeo = new THREE.Geometry();
    this.cellGeo.vertices = verts;
    this.cellGeo.verticesNeedUpdate = true;

    this.cellShapeGeo = new THREE.ShapeGeometry(this.cellShape);
    */
  return cellShape;
}

// -------------------------------------
