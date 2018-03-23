import {Enum} from 'enumify';
import Vue from 'vue/dist/vue.esm';
import {create, setCenter} from '../utils/dom-utils';

class LayersProto extends Enum {

}

LayersProto.initEnum(['Default', 'Static', 'Dynamic', 'Environment', 'Log', 'Warn', 'Error', 'Bounds']);

LayersProto.enumValueOfOrdinal = function (ordinal) {
  return this.enumValues.find(function (x) {
    return x.ordinal === ordinal;
  });
};

/**
 * Note: to self.. aframe.. use getObject3D('mesh') instead of object3D both of which are different objects. the later (a group) is not impacted by layers
 * @param obj
 * @param layers
 */
export function setLayersForObject (obj, ...layers) {
  if (!obj.layers) throw new Error('does not have layers attribute');

  // disable all layers
  // obj.layers.set(Layers.Default.ordinal);
  // obj.layers.disable(Layers.Default.ordinal);
  obj.layers.mask = 0;

  // enable only layers that where omitted
  layers.forEach((l) => {
    if (l.ordinal == undefined) { console.warn(l); throw new Error('contains invalid layer'); }

    obj.layers.enable(l.ordinal);
  });
}

var handler = {
  get: function (target, name) {
    if (name in target) {
      return target[name];
    } else throw new Error('missing param - Enum Layers:', name);
  }
};

/**
 *
 * A layer enum fro three-js.
 * Note: there must not be more than 32 Layers
 *
 *@enum
 *  Layers.Default - The Default layer.
 *  Layers.Static - A Layer for elements that should be static. Like regions/patches, heightmaps or meshes for buildings. (elements that are used for physics as static-body)
 *  Layers.Dynamic
 *  Layers.Environment - A Layer for elements that render background and environment elements.
 *  Layers.Log - A Layer that is used for elements that show logging information within the 3d world
 *  Layers.Warn - A Layer that is used for elements that show warnings within the 3d world
 *  Layers.Error - A Layer that is used for elements that show errors within the 3d world
 *  Layers.Bounds - A Layer for elements that render bounding volumes.
 */

export var Layers = new Proxy(LayersProto, handler);

/**
 * debug GUI for layers
 */
export function createCameraConfigGUI (camera) {
  // datasource -------------------------------------
  var _layers = Layers.enumValues.map(v => {
    return {name: v.name, ordinal: v.ordinal};
  });
    // test initial camera settings
  _layers.forEach(function (l) { l.visible = camera.layers.test({mask: 1 << l.ordinal}); });

  // template -------------------------------------
  var el = create(`
  <div>
  
 
    <div v-for="l in layers">
      <ui-switch v-model="l.visible" @change="onRowClicked(l)" >{{ l.name }}</ui-switch>
    </div>
  
    </div>
  `);

  // vue -------------------------------------
  var app = new Vue({
    el: el,
    data: {
      layers: _layers
    },
    methods: {
      onRowClicked: function (layer) {
        if (layer.visible) { camera.layers.enable(layer.ordinal); } else { camera.layers.disable(layer.ordinal); }
      }
    }
  });

  return app;
}
