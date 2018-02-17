
/*
tQuery.registerStatic('createCarCameraControls', function(opts, world){
	// handle parameters
	world	= world	|| tQuery.world;

	var controls	= new tQuery.CarCameraControls(opts);
	world.setCameraControls(controls);
	return controls;
});
*/

import Car from './tquery.car';

const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;

export default class CarCameraControls {
  /**
     *
     *
     * @param opts -
     * @param {Car} opts.car - the car contructor
     * @param opts.camera - instanceof THREE.Camera
     */
  constructor (opts) {
    // handle parameters polymorphism
    if (opts instanceof Car) {
      opts = {car: opts};
    }
    // handle parameters
    this._opts = opts;

    // sanity check
    // console.assert(this._opts.car instanceof Car);

    this._prevPosition = null;
    this._curAngle = 0;
    this._curDistance = 0;
  }

  /**
     * called to update camera depending on  relativecar position
     */
  update () {
    function getDirection (obj) {
      var matrix = new THREE.Matrix4();
      matrix.extractRotation(obj.matrix);

      var direction = new THREE.Vector3(0, 0, 1);
      // matrix.multiplyVector3(direction);
      direction.applyMatrix4(matrix);
      return direction;
    }

    // attempts at camera control
    var spdDistance	= 0.95;
    var maxAngle	= Math.PI / 5;
    var spdAngle	= 0.85;
    var car		= this._opts.car;
    var tObject3d	= car.el.object3D;

    var carAngle	= car._car._car.carOrientation;

    this._curAngle	= spdAngle * this._curAngle + (1 - spdAngle) * carAngle;
    this._curAngle	= Math.max(this._curAngle, carAngle - maxAngle);
    this._curAngle	= Math.min(this._curAngle, carAngle + maxAngle);

    var distance	= -1;
    if (this._prevPosition) {
      var delta	= tObject3d.position.clone().sub(this._prevPosition);
      var speed	= delta.length();
      speed		= Math.max(speed, 0);
      speed		= Math.min(speed, 0.15);
      distance	= -1 - (speed / 0.15) * 4;

      this._curDistance	= spdDistance * this._curDistance + (1 - spdDistance) * distance;
    }
    this._prevPosition	= tObject3d.position.clone();

    // set camera position
    var tCamera	= this._opts.camera;
    var position	= new THREE.Vector3(0, 0.35, -0.4 + 0.3 * this._curDistance);

    var matrix	= new THREE.Matrix4().makeRotationY(this._curAngle);

    position.applyMatrix4(matrix).add(tObject3d.position);

    // add a distance between camera and car

    var direction = getDirection(tObject3d);

    direction = direction.normalize().negate().multiplyScalar(3);
    // 5 units above level ground
    direction.y = 2;

    // tCamera.position.copy(position);
    // we want the camera group position to be set in this case
    tCamera.parent.position.copy(position.add(direction));
    window.cam = tCamera;
    // set set camera target
    // var tCamera	= this._opts.world.tCamera();
    var target	= new THREE.Vector3(0, 0, -2 * this._curDistance);
    var matrix	= new THREE.Matrix4().makeRotationY(this._curAngle);
    target.applyMatrix4(matrix).add(tObject3d.position);
    // tCamera.up.set(0, 1, 0);
    // tCamera.lookAt(target);
  }
}
