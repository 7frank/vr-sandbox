
import $ from 'jquery';

export function setPosition (el, v) {
  var arr = v.split(' ');

  var v2 = {x: Number(arr[0]), y: Number(arr[1]), z: Number(arr[2])};
  console.log(v);
  if (el.body != null && el.body.position != null) {
    el.body.position.copy(v2);
    el.body.velocity.set(0, 0, 0);
  } else el.setAttribute('position', v);
}

export function playSound (assetSelector, duration = -1) {
  $.each($(assetSelector), function () {
    this.components.sound.playSound();
  });

  if (duration > 0) {
    setTimeout(function () {
      $.each($(assetSelector), function () {
        this.components.sound.stopSound();
      });
    }, duration);
  }
}
