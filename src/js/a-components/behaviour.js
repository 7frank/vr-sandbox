import {getDirectionForEntity} from '../utils/aframe-utils';

/**
* basic entry point for ai sandboxing in 3d
 * TODO test and customise if ok
 * TODO a state machine would be nice to wrap behaviours also this should probably be a event based b.c. we want to have some authorative multi player sometime
 */

AFRAME.registerComponent('behaviour', {
  init: function () {
    var obj = this.el.getObject3D('mesh') || this.el.object3D;
    var entity = this.el;
    /**
         * have some basic movement pattern that can be customised
         *
         * e.g. behaviour="fear:.player;like:.ball"
         *
         *
         *
         */

    requestAnimationFrame(function tick (delta) {
      requestAnimationFrame(tick);

      let dir = getDirectionForEntity(entity);
      dir.multiplyScalar(delta);

      dir.multiplyScalar(-10);
      entity.object3D.position.add(dir);

      if (entity.object3D.position.length() > 100) { entity.object3D.position.set(0, 0, 0); }
    });
  }
});
