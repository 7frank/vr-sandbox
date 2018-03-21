
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
import {lookAtAndOrient, lookAwayFrom} from '../../utils/aframe-utils';

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

    var tCamera	= this._opts.camera;
    // set camera position

    // ------------------------

    // set camera position
    // var position	= new THREE.Vector3(0, 0.35, -0.4 + 0.3 * this._curDistance);
    var position	= new THREE.Vector3(0, 2.35, -2 + 1.5 * this._curDistance);

    var matrix	= new THREE.Matrix4().makeRotationY(this._curAngle);
    position.applyMatrix4(matrix).add(tObject3d.position);

    tCamera.parent.position.copy(position);

    // set set camera target

    // TODO evaluate what was / is going on with the code below here as lookat was looking in the opposite direction

    /*
    var target	= new THREE.Vector3(0, 0, -2 * this._curDistance);
    var matrix	= new THREE.Matrix4().makeRotationY(this._curAngle);
    target.applyMatrix4(matrix).add(tObject3d.position);
    tCamera.parent.lookAt(target);
    */
    // meanwhile this method solves the problem partially
    lookAwayFrom(tCamera.parent, tObject3d);
  }
}
