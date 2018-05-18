import './gui-list-view';
import './gui-color-list';
import './gui-material-list';

import _ from 'lodash';
import {appendHTML3D, createHTML} from '../../utils/dom-utils';

// TODO color buttons component
// simple material edit component

AFRAME.registerComponent('simple-color-select', {
  schema: {
    colors: {type: 'string', default: 'black,red,white'}
  },

  init: function () {

  }

});

/**
 * Prototyping....
 * currently only working for simple-car
 *
 */

AFRAME.registerComponent('product-configurator', {
  schema: {
    template: {type: 'string'}
  },
  tick: function () {
    // TODO billboard stays not 100% in place when moving
    // TODO refactor into "billboard-cheap"
    this.el.object3D.setRotationFromQuaternion(document.querySelector('[camera]').object3D.quaternion);
  },
  init: function () {
    var el = this.el;// document.querySelectorAll('a-simple-car')[1];

    var mats = AFRAME.nk.querySelectorAll(el, '.Mesh:where(material)');

    var [chassis, ...tires] = mats.map(el => el.material);

    // load product // no additional meshes for now

    // ------------------------------

    function createColorListView (parent, caption, handler, options) {
      var template = `
                            <a-entity class="backPlane"  scale='.25 .25 .25' >
                              <a-entity gui-color-list="caption:${caption}"></a-entity>             
                            </a-entity>
                            `;

      var el = createHTML(template);

      parent.appendChild(el);

      var colorListEl = el.querySelector('[gui-color-list]');
      colorListEl.addEventListener('change', handler);

      _.each(options, (v, k) => colorListEl.setAttribute(k, v));
    }

    function createMaterialListView (parent, caption, handler, options) {
      var template = `
                            <a-entity class="backPlane"  scale='.25 .25 .25' >
                              <a-entity gui-material-list="caption:${caption}"></a-entity>             
                            </a-entity>
                            `;

      var el = createHTML(template);

      parent.appendChild(el);

      var colorListEl = el.querySelector('[gui-material-list]');
      colorListEl.addEventListener('change', handler);

      _.each(options, (v, k) => colorListEl.setAttribute(k, v));
    }

    // ------------------------------

    createColorListView(el, 'body reflect', function (e) {
      tires.forEach(function (tireMaterials) {
        // tires[0] emissiveColor=> rim //aber auch karossierie des autos
        tireMaterials[0].emissive = new THREE.Color(e.detail.color);
      });
    }, {position: '4 6 0'});

    createColorListView(el, 'tires', function (e) {
      tires.forEach(function (tireMaterials) {
        // tires[1] color=> tread //aber auch frontblende des autos
        tireMaterials[1].color = new THREE.Color(e.detail.color);
      });
    }, {position: '3 6 0'});

    createMaterialListView(el, 'materials', function (e) {
      console.log('material selected', e.detail, tires);
      tires.forEach(function (tireMaterials) {
        // tires[0] emissiveColor=> rim //aber auch karossierie des autos
        tireMaterials[0].copy(e.detail.material);
      });
    }, {position: '-5 6 0'});
  },
  remove: function () {
    var planes = this.el.querySelectorAll('.backPlane');
    planes.forEach(a => a.parentEl.remove(a));
  }

});
