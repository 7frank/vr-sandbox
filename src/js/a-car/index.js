import Car from './car/tquery.car';

function getCompoundBoundingBox (object3D) {
  var box = new THREE.Box3();
  box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));

  object3D.traverse(function (obj3D) {
    var geometry = obj3D.geometry;
    if (geometry === undefined) return;
    geometry.computeBoundingBox();
    if (box === null) {
      box = geometry.boundingBox;
    } else {
      box.union(geometry.boundingBox);
    }
  });
  return box;
}

/**
 * restarts physics for an entity
 * example: restartPhysics($("a-simple-car"), "dynamic-body", "shape: box; mass: 2")
 *
 * @param el
 * @param bodyType
 * @param defaultVal
 * @param overrideVal
 */

function restartPhysics (el, bodyType = 'dynamic-body', defaultVal = '', overrideVal = false) {
  var val;
  if (!overrideVal) val = el.getAttribute(bodyType);
  if (val == null) val = defaultVal;
  el.removeAttribute(bodyType);
  el.setAttribute(bodyType, val);
}

const AFRAME = window.AFRAME;
const THREE = AFRAME.THREE;
var extendDeep = AFRAME.utils.extendDeep;

/**
 *  The afreame component that loads the car
 *
 *  example usage: <a-entity simple-car position="0 1 -10"></a-entity>
 *
 */

AFRAME.registerComponent('simple-car', {
  schema: {
    mtl: {type: 'model'},
    obj: {type: 'model'}
  },

  init: function () {
    var el = this.el;
    var that = window.car = this;

    var car = new Car({el: this.el});
    this._car = car;

    this.model = car.model();

    // this.model.boundingBox = getCompoundBoundingBox(this.model);

    // Entity.
    el.setObject3D('mesh', this.model);

    // FIXME obj should emit proper events to signal if it is loaded for physics
    setTimeout(function () {
      restartPhysics(that.el);
    }, 2000);

    // el.emit('model-loaded', {format: 'obj', model: this.model});

    /*      this.model = null;
        /*  this.objLoader = new THREE.OBJLoader();
            this.mtlLoader = new THREE.MTLLoader(this.objLoader.manager);
            // Allow cross-origin images to be loaded.
            this.mtlLoader.crossOrigin = ''; */
  },

  update: function () {
    /*    var data = this.data;
        if (!data.obj) { return; }
        this.remove();
        this.loadObj(data.obj, data.mtl);**/
  },

  remove: function () {
    if (!this.model) {
      return;
    }
    this.el.removeObject3D('mesh');
  },

  loadObj: function (objUrl, mtlUrl) {
    var self = this;
    var el = this.el;
    var mtlLoader = this.mtlLoader;
    var objLoader = this.objLoader;

    if (mtlUrl) {
      // .OBJ with an .MTL.
      if (el.hasAttribute('material')) {
        console.warn('Material component properties are ignored when a .MTL is provided');
      }
      mtlLoader.setTexturePath(mtlUrl.substr(0, mtlUrl.lastIndexOf('/') + 1));
      mtlLoader.load(mtlUrl, function (materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(objUrl, function (objModel) {
          self.model = objModel;
          el.setObject3D('mesh', objModel);
          el.emit('model-loaded', {format: 'obj', model: objModel});
        });
      });
      return;
    }

    // .OBJ only.
    objLoader.load(objUrl, function loadObjOnly (objModel) {
      // Apply material.
      var material = el.components.material;
      if (material) {
        objModel.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = material.material;
          }
        });
      }

      self.model = objModel;
      el.setObject3D('mesh', objModel);
      el.emit('model-loaded', {format: 'obj', model: objModel});
    });
  }
});

var meshMixin = AFRAME.primitives.getMeshMixin();
var registerPrimitive = AFRAME.registerPrimitive;
var utils = AFRAME.utils;

/**
 *  The aframe primitive that create a stand alone web-component from the component 'simple-car'
 *
 *  example usage: <a-simple-car dynamic-body position="0 5 -5" ></a-simple-car>
 *
 */

AFRAME.registerPrimitive('a-simple-car', utils.extendDeep({}, meshMixin, {
  defaultComponents: {
    'simple-car': {}
  },

  mappings: {
    src: 'obj-model.obj',
    mtl: 'obj-model.mtl'
  }
}));
