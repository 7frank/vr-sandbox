import {
  findClosestEntity, getDirectionForEntity, getPosition, getSignedAngle,
  getUnsignedAngle,
  lookAwayFrom,
  setPosition,
  vector2Quaternion
} from '../utils/aframe-utils';

import * as _ from 'lodash';
import {AiScripts, FPSCtrl, FPSInfo, Scripts} from '../utils/fps-utils';
import {getAnimationNames, playAnimation} from '../utils/animation-utils';

// TODO (1) test this with some small state machine .. eg. run away if distance gt 20; if distance smaller 5 run towards; if distance <2 attack
//      (2) evaluate: is it better to have an extermal state component that keeps track of distance, health and such or is it better to have the state machine inside the the component itself?
// TODO ThreeSteer see https://github.com/erosmarcon/three-steer/blob/master/js/ThreeSteer.js
// library with rudimentary behaviours but in x-z- plane

AFRAME.registerComponent('behaviour-attraction', {
  schema: {
    distance: {
      default: 7 // the distance at which the entity starts moving
    },
    speed: { // in meter (or rather units) per second, to simulate retraction use negative vales
      default: 1
    },
    'min-distance': {
      default: 1.5 // the minimum distance at which the behaviour occurs
    },
    rotational_speed: { // in angles per second
      default: 30
    },
    ticksPerSecond: { // how smooth the behaviour appears
      default: 30
    },
    target: {
      default: '.player' // how to model hostility maybe by class .team-1 2 3 ...
    }

  },

  init: function () {
    /**
         * TODO have some default scripts that can be reused where the result is put into a shared object and which is available to all other scripts
         * so a proximity check might only occure every 1 second but a rotation towards that element might occur more often
         * so a script should have a 'shared'- object parameter
         * @type {Scripts}
         */
    this.aiScripts = new Scripts(this)
      .add('restartAnimation', 1, function (e, shared) {
        // change animation if possible at random
        // FIXME the cross fade doesn't work
        var names = getAnimationNames(this.el);
        if (names.length > 0) {
          playAnimation(this.el, _.sample(names), 800);
        }
      })
      .add('proximityCheck', 1, function (e, shared) {
        // test if the player is close enough
        shared.currentTarget = findClosestEntity(this.data.target, this.el, this.data.distance);
      })
      .add('moveActor', this.data.ticksPerSecond, function (e, shared) {
        if (!shared.currentTarget) return;

        let targetPos = getPosition(shared.currentTarget);
        let mPos = getPosition(this.el);

        // moves to the new position with constant speed
        var distanceVector = targetPos.clone().sub(mPos);

        if (distanceVector.length() < this.data['min-distance']) return;

        var targetVector = distanceVector.normalize();
        targetVector.multiplyScalar(this.data.speed / this.data.ticksPerSecond);
        targetVector.y = 0;

        setPosition(this.el, mPos.add(targetVector));

        shared.targetVector = targetVector;

        // ------------------------------
        // TODO test and make use of
        this.el.emit('behaviour', {type: 'attraction', target: shared.currentTarget});
      })
      .add('rotateIntoMoveDirection', this.data.ticksPerSecond, function (e, shared) {
        if (!shared.targetVector) return;

        // rotate around axis with a constant rotational speed
        let axisOfRotation = this.el.object3D.up;
        let angleOfRotation = this.data.rotational_speed / 360 * Math.PI * 2 / this.data.ticksPerSecond; // must be the rotation angle + or minus
        let quaternionEl = this.el.object3D.quaternion.clone();

        // ------------------------------
        // we want the element to face in parallel to the the distance between both positions
        // get the current direction facing
        let directionEl = getDirectionForEntity(this.el);

        // calculate the  current angle in degree
        let normalVector = axisOfRotation.clone().normalize();
        var angle = getSignedAngle(shared.targetVector, directionEl, normalVector);
        var angleInDegree = angle / (2 * Math.PI) * 360;

        // ------------------------------
        // rotate the entity a small amount based on the angleInDegree
        if (Math.abs(angleInDegree) > 20) {
          if (angleInDegree > 0) angleOfRotation *= -1;

          // create a quaternion that we can use to increase or decrease the rotation of our element
          let quaternionDelta = new THREE.Quaternion().setFromAxisAngle(axisOfRotation, angleOfRotation);
          // multiplying quaternions will add their rotations
          quaternionEl.multiply(quaternionDelta);
          // apply new rotation increment
          this.el.object3D.rotation.setFromQuaternion(quaternionEl);
        }
      })
      .play('*');
  },

  getPerformanceInfo () {
    return FPSInfo('attraction')
      .addScripts(this.aiScripts)
      // .add('moveActor', this.aiScripts.moveActor)
    // .add('proximityCheck', this.aiScripts.proximityCheck)
      .compile();
  }

});
