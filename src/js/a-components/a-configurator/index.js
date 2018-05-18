import './gui-list-view';
import './gui-color-list';

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
  init: function () {
    var accents = {
      'Magenta': '255,0,151',
      'Purple': '162,0,255',
      'Teal': '0,171,169',
      'Lime': '140,191,38',
      'Brown': '160,80,0',
      'Pink': '230,113,184',
      'Orange': '240,150,9',
      'Blue': '27,161,226',
      'Red': '229,20,0',
      'Green': '51,153,51'

    };

    var el = this.el;// document.querySelectorAll('a-simple-car')[1];

    var mats = AFRAME.nk.querySelectorAll(el, '.Mesh:where(material)');

    var [chassis, ...tires] = mats.map(el => el.material);

    // load product //no additional meshes for now

    // ------------------------------

    function createColorListView (parent, caption, colorMap, handler, options) {
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

    // ------------------------------

    createColorListView(el, 'body reflect', accents, function (e) {
      tires.forEach(function (tireMaterials) {
        // tires[0] emissiveColor=> rim //aber auch karossierie des autos
        tireMaterials[0].emissive = new THREE.Color(e.detail.color);
      });
    }, {position: '4 6 0'});

    createColorListView(el, 'tires', accents, function (e) {
      tires.forEach(function (tireMaterials) {
        // tires[1] color=> tread //aber auch frontblende des autos
        tireMaterials[1].color = new THREE.Color(e.detail.color);
      });
    }, {position: '-5 6 0'});
  },
  remove: function () {
    var planes = this.el.querySelectorAll('.backPlane');
    planes.forEach(a => a.parentEl.remove(a));
  }

});
