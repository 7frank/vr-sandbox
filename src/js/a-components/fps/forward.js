AFRAME.registerComponent('forward', {
  schema: {
    speed: {default: 10} // meter/second
  },

  init: function () {
    var worldDirection = new THREE.Vector3();

    this.el.object3D.getWorldDirection(worldDirection);
    worldDirection.multiplyScalar(-1);

    this.worldDirection = worldDirection;
    console.error(this.worldDirection);
  },

  tick: function (time, delta) {
    var el = this.el;

    var currentPosition = el.getAttribute('position');
    var newPosition = this.worldDirection
      .clone()
      .multiplyScalar(this.data.speed * delta / 1000)
      .add(currentPosition);
    el.setAttribute('position', newPosition);
  }
});
