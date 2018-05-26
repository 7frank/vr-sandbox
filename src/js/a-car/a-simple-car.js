import './simple-car';

var extendDeep = AFRAME.utils.extendDeep;

var meshMixin = AFRAME.primitives.getMeshMixin();
var registerPrimitive = AFRAME.registerPrimitive;
var utils = AFRAME.utils;

/**
 *  The aframe primitive that create a stand alone web-component from the component 'simple-car'
 *
 *  example usage: <a-simple-car dynamic-body position="0 5 -5" ></a-simple-car>
 *
 */

delete AFRAME.components['a-simple-car'];
AFRAME.registerPrimitive('a-simple-car', utils.extendDeep({}, meshMixin, {
  defaultComponents: {
    'simple-car': {},
    'customizable-wasd-car-controls': {}, // add car controls
    'configurable': {} // enable the default configuration menu
  },
  mappings: {
    type: 'simple-car.type'
  }
}));
