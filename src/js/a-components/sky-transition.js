/**
 * sky with transitions. example: <a-sky-transition><a-sky color="yellow"></a-sky></a-sky-transition>
 */
// var meshPrimitives = require('./meshPrimitives');
AFRAME.registerPrimitive('a-sky-transition', {
  defaultComponents: {
    'sky-transition': {}
  },
  //  mappings: utils.extendDeep({}, meshPrimitives['a-sphere'].prototype.mappings)
  mappings: {}
});

AFRAME.registerComponent('sky-transition', {
  schema: {
    scalingFactor: {type: 'number', default: 1} // TODO have an additional option => cover contain where scaling is deendent on size of mesh and container
  },
  init: function () {
    var sky1 = this.el.sceneEl.querySelector('a-sky');

    sky1.setAttribute('animation', 'property:opacity;from:1;to:0;dur:1000;easing:linear;loop:false');

    if (sky1) {
      sky1.addEventListener('animationcomplete', () => {
        sky1.parentElement.remove(sky1);
      });
    }

    var sky2 = this.el.querySelector('a-sky');
    this.el.sceneEl.append(sky2);
    sky2.setAttribute('material', 'opacity', 0);
    sky2.setAttribute('radius', 5500);

    sky2.setAttribute('animation', 'property:opacity;from:0;to:1;dur:1000;easing:linear;loop:false');

    sky2.addEventListener('animationcomplete', () => {
      sky2.setAttribute('radius', 5000);
    });
  },
  remove: function () {
  }
});
