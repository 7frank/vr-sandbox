import Car from './car/tquery.car';
import {enterOrExitVehicle} from '../car.refactor';
import {createHTML} from '../utils/dom-utils';

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

var extendDeep = AFRAME.utils.extendDeep;

/**
 *  The afreame component that loads the car
 *
 *  example usage: <a-entity simple-car position="0 1 -10"></a-entity>
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

    el.addEventListener('interaction-pick', enterOrExitVehicle);

    // FIXME using menu wrapper will break ability to do the editing
    // var menu = createHTML(`<a-entity class="menu-placeholder">`);
    // el.append(menu);
    // el.addEventListener('interaction-talk', () => menu.hasAttribute('product-configurator') ? menu.removeAttribute('product-configurator') : menu.setAttribute('product-configurator', true));

    el.setAttribute('configurable', true);

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
  }

  /*,

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
      } */
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

delete AFRAME.components['a-simple-car'];
AFRAME.registerPrimitive('a-simple-car', utils.extendDeep({}, meshMixin, {
  defaultComponents: {
    'simple-car': {}
  },
  mappings: {
    type: 'simple-car.type'
  }
}));

var utils = AFRAME.utils;

var bind = utils.bind;

/*
* inits controls based on the "keyboard-actions" plugin
*
**/

delete AFRAME.components['customizable-wasd-car-controls'];

AFRAME.registerComponent('customizable-wasd-car-controls', {
  schema: {},
  init: function () {
    // Bind methods and add event listeners.
    this.onBlur = bind(this.onBlur, this);
    this.onFocus = bind(this.onFocus, this);

    this.onVisibilityChange = bind(this.onVisibilityChange, this);
    this.attachVisibilityEventListeners();
  },
  // update: function () {},
  // tick: function () {},
  remove: function () {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
  },

  play: function () {
    this.attachKeyEventListeners();
  },

  pause: function () {
    this.keys = {};
    this.removeKeyEventListeners();
  },
  attachVisibilityEventListeners: function () {
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },

  removeVisibilityEventListeners: function () {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  attachKeyEventListeners: function () {
    //  window.addEventListener('keydown', this.onKeyDown);
    // window.addEventListener('keyup', this.onKeyUp);

    let simpleCarComponentInstance = this.el.components['simple-car'];

    if (!simpleCarComponentInstance) {
      console.error("'customizable-wasd-car-controls' must be attribute of 'a-simple-car'");
      return;
    }

    // should be an instance of './car/tquery.car' {@see Car}
    var that = simpleCarComponentInstance._car;

    if (!that) {
      console.error("component 'simple-car' not compatible with 'a-simple-car'");
      return;
    }

    /**
         *
         * @param action - the internal action that should be triggered
         * @param bVal - a value indicating wheather the first or the second handler of an
         *                action should be handled. An action does have an optional value that is meant to work
         *                as undo for the first handler so if a click event is sent the action will trigger
         *                a down and up event for the action if 2 handlers where defined for it.
         * @returns {Function}
         */
    function keyHandler (action, bVal) {
      return function (event) {
        // TODO check the doc.activeel==doc.body part for potential conflict
        // if (!shouldCaptureKeyEvent(event)) { return; }

        var obj = that.controls();

        if (event.detail.first) {
          obj[action] = true;
        } else {
          obj[action] = false;
        }
      };
    }

    this.khw = keyHandler('moveForward');
    this.khs = keyHandler('moveBackward');
    this.kha = keyHandler('moveLeft');
    this.khd = keyHandler('moveRight');

    window.addEventListener('player-move-forward', this.khw);
    window.addEventListener('player-move-backward', this.khs);
    window.addEventListener('player-strafe-left', this.kha);
    window.addEventListener('player-strafe-right', this.khd);
  },

  removeKeyEventListeners: function () {
    window.removeEventListener('player-move-forward', this.khw);
    window.removeEventListener('player-move-backward', this.khs);
    window.removeEventListener('player-strafe-left', this.kha);
    window.removeEventListener('player-strafe-right', this.khd);
  },

  onBlur: function () {
    this.pause();
  },

  onFocus: function () {
    this.play();
  },

  onVisibilityChange: function () {
    if (document.hidden) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  }
});
