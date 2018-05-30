import './gui-list-view';
import './gui-color-list';
import './gui-material-list';
import './gui-mesh-list';
import './gui-template-list';
import _ from 'lodash';
import {appendHTML3D, createHTML} from '../../utils/dom-utils';
import {createGlowForMesh} from './glow-shader';
import {FPSCtrl} from '../../utils/fps-utils';
import {namespaceExists} from '../../utils/namespace';
import './available-colors';
import {toast} from '../../utils/aframe-utils';

/**
 * Prototyping....
 * currently only working for simple-car
 *
 */
toast('use nk-list-view to refactor prod-conf and others', 15000);

AFRAME.registerComponent('product-configurator', {
  schema: {
    target: {type: 'selector'},
    useConfig: {type: 'boolean', default: false}
  },
  tick () {
    /*    // attach created stuff to scene
            var obj = this.el.object3D;
            var sceneObj = this.el.sceneEl.object3D;
            if (obj.parent != sceneObj) {
              sceneObj.add(obj);
            } else {
              var pos = getWorldPosition(this.el.parentEl.object3D);
              obj.position.copy(pos);
            } */

  },
  update: function () {

  },
  resetWidgets: function () {
    // when recreating the product configurator or when appending somewhere else within the DOM this should be called

    var pc = this.el;
    pc.innerHTML = '';
    // pc.querySelectorAll('[gui-item]').forEach(n => n.parentElement.removeChild(n));
    // $(".center-region").appendChild(pc)
  },
  init: function () {
    var that = this;
    // prevent config data from rendering directly
    this.configData = '<span>' + this.el.innerHTML + '</span>';
    this.el.innerHTML = '';

    var el = this.el;

    // set target to self by default
    // if (!this.data.target) this.data.target = el;

    var mats = AFRAME.nk.querySelectorAll(el, '.Mesh:where(material)');

    var [chassis, ...tires] = mats.map(el => el.material);

    // load product // no additional meshes for now

    // ------------------------------

    // hides the helper if entity not visible
    this.mHelperScript = new FPSCtrl(2, function () {
      var vis = this.el.getAttribute('visible');

      if (namespaceExists('mesh.material', this.mGlowHelper)) {
        this.mGlowHelper.mesh.material.visible = vis;
      }
    }, this).start();

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
      return el;
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
      colorListEl.addEventListener('change-todo', handler);

      _.each(options, (v, k) => colorListEl.setAttribute(k, v));
      return el;
    }

    function createConfigMaterialListView (parent, caption, handler, options) {
      var template = `
                            <a-entity class="backPlane"  scale='.25 .25 .25' >
                              <a-entity gui-list-view="caption:${caption}"></a-entity>             
                            </a-entity>
                            `;

      var el = createHTML(template);

      parent.appendChild(el);

      var configMaterialListEl = el.querySelector('[gui-list-view]');

      // ----------------------------

      if (that.data.useConfig) {
        setTimeout(() => {
          var config = createHTML(that.configData);
          var materials = config
            .querySelectorAll('[material]')
            .toArray()
            .map(el => el.getAttribute('material'));

          console.log('configMaterialListEl', configMaterialListEl, materials);
          window.configMaterialListEl = configMaterialListEl;

          // var matList = configMaterialListEl.components['gui-list-view'];
          // matList.data.items = materials;
          configMaterialListEl.setAttribute('gui-list-view', 'items', materials);
        }, 1);
      }

      // ----------------------------

      configMaterialListEl.addEventListener('change', handler);

      _.each(options, (v, k) => configMaterialListEl.setAttribute(k, v));
    }

    // --------------------------------------------
    // TODO refactor listview and references to data
    function getAllValuesFromListView (el) {
      var listView = el.querySelector('[gui-list-view]').components['gui-list-view'];

      var meshes = listView.vm.$data.items.map(v => v.value);
      return meshes;
    }

    // --------------------------------------------
    function createMeshListView (parent, caption, handler, options) {
      var template = `<a-entity class="backPlane" id="meshList" scale='.25 .25 .25'  gui-mesh-list="caption:${caption}"></a-entity>`;

      var el = createHTML(template);

      parent.appendChild(el);

      el.setAttribute('gui-mesh-list', 'target', parent.parentEl);

      // TODO rely on change event again as soon as list-view is fixed
      el.addEventListener('change-todo', handler);

      _.each(options, (v, k) => el.setAttribute(k, v));
    }

    // ------------------------------
    // ------------------------------
    // ------------------------------
    // ------------------------------

    var lastEl, lastElWireframe, lastElGlow, lastElGlowTimer;

    createMeshListView(el, 'meshes', function (e) {
      lastEl = e.detail.value;

      // opaopa ------------------------
      // FIXME get all meshes again
      // var meshes = getAllValuesFromListView(el.querySelector('[gui-mesh-list]'));
      // console.log('meshes in list', meshes);
      var meshes = [];

      console.log('mesh selected', lastEl);

      // copy orig
      meshes.forEach(mesh => {
        if (!_.has(mesh, 'material._op')) _.set(mesh, 'material._op', _.get(mesh, 'material.opacity', 1));
      });

      // TODO have alternative approach to make all materials transparent
      meshes.forEach(mesh => {
        _.set(mesh, 'material.transparent', true);
      });

      // make other meshes transparent
      meshes.forEach(function (mesh) {
        if (lastEl == mesh) {
          _.set(mesh, 'material.opacity', _.get(mesh, 'material._op'));
        } else {
          _.set(mesh, 'material.opacity', _.get(mesh, 'material._op') * 0.5);
        }
      });

      // glow ---------------------

      // remove prev glow overlay
      if (namespaceExists('mesh.parent', lastElGlow)) {
        lastElGlow.mesh.parent.remove(lastElGlow.mesh);
      }
      // add new glow overlay
      that.mGlowHelper = lastElGlow = createGlowForMesh(lastEl, lastEl.el.object3D, lastEl.el.sceneEl.camera.el.object3D);

      if (lastElGlowTimer) lastElGlowTimer.pause();
      // update position every now and then (in case mesh is moved)
      lastElGlowTimer = new FPSCtrl(10, function (e) {
        lastElGlow.mesh.position.copy(lastEl.position);
      }).start();

      lastEl.parent.add(lastElGlow.mesh);
    }, {position: '-2 1 0'});

    // ------------------------------

    /*  createColorListView(el, 'body reflect', function (e) {
      if (lastEl) {
        lastEl.material.color = new THREE.Color(e.detail.color);
      } else {
        tires.forEach(function (tireMaterials) {
          // rim aber auch karosserie des autos
          tireMaterials[0].emissive = new THREE.Color(e.detail.color);
        });
      }
    }, {position: '4 6 0'}); */

    createColorListView(el, 'tires', function (e) {
      if (lastEl) {
        var c = new THREE.Color(e.detail.value);
        console.log('new color', c, e.detail);
        lastEl.material.color = c;
      } else toast('select mesh first');/* else {
        tires.forEach(function (tireMaterials) {
          // tread aber auch frontblende des autos
          console.log('material', e.details);
          tireMaterials[1].color = new THREE.Color(e.detail.color);
        });
      } */
    }, {position: '4 4 0'});

    createMaterialListView(el, 'materials', function (e) {
      console.log('material selected', e.detail, tires);

      if (lastEl) {
        // lastEl.material.copy(e.detail.material);
        lastEl.material = e.detail.value;
      } else toast('select mesh first');/* else {
        tires.forEach(function (tireMaterials) {
          // tires[0] emissiveColor=> rim //aber auch karosserie des autos
          tireMaterials[0].copy(e.detail.value);
        });
      } */
    }, {position: '-5 7 0'});

    // --------------------------------
    /* createConfigMaterialListView(el, 'conf-mat', function (e) {
      if (lastEl) {
        // lastEl.material.copy(e.detail.material);

        toast(e.detail.value);
        // lastEl.material = e.detail.value;
      } else toast('select mesh first');
    }, {position: '-5 6 0'});

    */
  },
  remove: function () {
    var planes = this.el.querySelectorAll('.backPlane');
    planes.forEach(a => a.parentEl.remove(a));

    this.mHelperScript.pause();

    if (namespaceExists('mesh.parent', this.mGlowHelper)) {
      this.mGlowHelper.mesh.parent.remove(this.mGlowHelper.mesh);
    }

    this.resetWidgets();
  }

});
