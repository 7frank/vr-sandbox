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
  addRigidVehicleBody: function () {
    var sc = this.el;// = $('[simple-car]');
    var db = sc.components['dynamic-body'];

    // reset original body
    db.body.shapes = [];
    db.body.updateMassProperties();

    //
    var chassisShape;
    var centerOfMassAdjust = new CANNON.Vec3(0, 0, -1);
    chassisShape = new CANNON.Box(new CANNON.Vec3(5, 2, 0.5));
    var chassisBody = db.body;// new CANNON.Body({ mass: 1 });
    chassisBody.addShape(chassisShape, centerOfMassAdjust);
    chassisBody.position.set(0, 0, 0);

    //

    var world = db.body.world;
    var demo = sc.object3D;// Create the vehicle

    var vehicle;

    var mass = 1; var centerOfMassAdjust = new CANNON.Vec3(0, 0, -1); var wheelMaterial = new CANNON.Material('wheelMaterial'); vehicle = new CANNON.RigidVehicle({
      chassisBody: chassisBody// db.body
    });
    var axisWidth = 7;
    var wheelShape = new CANNON.Sphere(1.5);
    var down = new CANNON.Vec3(0, 0, -1);
    var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
    wheelBody.addShape(wheelShape);
    vehicle.addWheel({
      body: wheelBody,
      position: new CANNON.Vec3(5, axisWidth / 2, 0).vadd(centerOfMassAdjust),
      axis: new CANNON.Vec3(0, 1, 0),
      direction: down
    });
    var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
    wheelBody.addShape(wheelShape);
    vehicle.addWheel({
      body: wheelBody,
      position: new CANNON.Vec3(5, -axisWidth / 2, 0).vadd(centerOfMassAdjust),
      axis: new CANNON.Vec3(0, -1, 0),
      direction: down
    });
    var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
    wheelBody.addShape(wheelShape);
    vehicle.addWheel({
      body: wheelBody,
      position: new CANNON.Vec3(-5, axisWidth / 2, 0).vadd(centerOfMassAdjust),
      axis: new CANNON.Vec3(0, 1, 0),
      direction: down
    });
    var wheelBody = new CANNON.Body({ mass: mass, material: wheelMaterial });
    wheelBody.addShape(wheelShape);
    vehicle.addWheel({
      body: wheelBody,
      position: new CANNON.Vec3(-5, -axisWidth / 2, 0).vadd(centerOfMassAdjust),
      axis: new CANNON.Vec3(0, -1, 0),
      direction: down
    });
    // Some damping to not spin wheels too fast
    for (var i = 0; i < vehicle.wheelBodies.length; i++) {
      vehicle.wheelBodies[i].angularDamping = 0.4;
    }
    // Constrain wheels
    var constraints = [];
    // Add visuals
    // demo.addVisual(vehicle.chassisBody);
    for (var i = 0; i < vehicle.wheelBodies.length; i++) {
      // demo.addVisual(vehicle.wheelBodies[i]);
    }
    vehicle.addToWorld(world);
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
      // FIXME not working T_T
      // this.addRigidVehicleBody();
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
