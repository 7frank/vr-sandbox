import Car from './car/tquery.car';
import {restartPhysics} from '../utils/aframe-utils';

var extendDeep = AFRAME.utils.extendDeep;

/**
 *  A component that generates a simple car entity.
 *
 *  example: <a-entity simple-car></a-entity>
 *  TODO have a more general vehicle rendering base component that defines
 *  - body,wheels,lights,doors,hood,trunk
 *  - load one or multiple meshes
 *  - specify which part of which mesh has what function
 *
 *  TODO don't have the car model be rotated but instead the container object to reduce some visual problems when physics is applied
 *
 */

delete AFRAME.components['simple-car'];

AFRAME.registerComponent('simple-car', {
  schema: {
    mtl: {type: 'model'},
    obj: {type: 'model'},
    type: {
      type: 'string',
      default: 'veyron'
    }
  },
  getCarInstance: function () {
    return this._car;
  },
  init: function () {
    var el = this.el;
    var that = this;

    // veyron,gallardo
    if (this.data.type != 'veyron' && this.data.type != 'gallardo') {
      this.data.type = 'veyron';
      console.warn("simple-car: currently only supports two types of car models 'veyron' and 'gallardo' ");
    }

    var car = new Car({el: this.el, type: this.data.type});
    this._car = car;

    that.el.addEventListener('model-loaded', () => {
      this.model = car.model();

      el.setObject3D('mesh', this.model);

      restartPhysics(that.el);
    });

    /*
            this.model = null;
            this.objLoader = new THREE.OBJLoader();
            this.mtlLoader = new THREE.MTLLoader(this.objLoader.manager);
            // Allow cross-origin images to be loaded.
            this.mtlLoader.crossOrigin = '';
            */
  },

  update: function () {
    /*
               var data = this.data;
               if (!data.obj) { return; }
               this.remove();
               this.loadObj(data.obj, data.mtl);
             */
  },

  remove: function () {
    if (!this.model) {
      return;
    }
    this.el.removeObject3D('mesh');
  }
  /*
      ,loadObj: function (objUrl, mtlUrl) {
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
          objLoader.load(objUrl, function loadObjOnly(objModel) {
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
      */
});
