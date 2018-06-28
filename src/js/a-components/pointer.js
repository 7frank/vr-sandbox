/**
 * system that keeps track of mouse position
 * @type {Array}
 */

const moveEvents = 'mousemove pointermove'.split(' ');

AFRAME.registerSystem('pointer', {

  init: function () {
    this.position = new THREE.Vector2();

    moveEvents
      .forEach(eventName => document.addEventListener(eventName, (e) => {
        this.event = e;
        this.position.x = (event.clientX / this.el.renderer.domElement.clientWidth) * 2 - 1;
        this.position.y = -(event.clientY / this.el.renderer.domElement.clientHeight) * 2 + 1;
      }, false)
      );
  }

});
