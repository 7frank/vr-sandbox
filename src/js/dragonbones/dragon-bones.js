import {HelloDragonBones} from './HelloDragonBones';

// FIXME currently using cdn version ..
// import * as dragonBones from './lib/dragonBones.js';

delete AFRAME.components['dragon-bones'];

AFRAME.registerComponent('dragon-bones', {
  schema: {
    mtl: {type: 'model'},
    obj: {type: 'model'},
    type: {
      type: 'string',
      default: 'veyron'
    }
  },

  init: function () {
    var el = this.el;
    var that = this;

    var group = new HelloDragonBones();
    group.scale.set(0.01, 0.01, 0.01);
    this.el.setObject3D('dragon-bones-group', group);
  },

  update: function () {

  },

  remove: function () {
    this.el.removeObject3D('dragon-bones-group');
  }
});
