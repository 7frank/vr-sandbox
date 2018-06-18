import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './entity-edit-menu.hbs';
import {showMenu} from '../utils/debug-gui';
import * as _ from 'lodash';

import TWEEN from '@tweenjs/tween.js';
import {querySelectorAll} from '../utils/selector-utils';
import {getWorldDirection, getWorldPosition} from '../utils/aframe-utils';
import {AnimationFactory} from '../utils/animation-utils';

AFRAME.registerComponent('entity-edit-menu', {
  schema: {},
  init: function () {
    this.createDialog();
  },

  createDialog: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    var that = this;
    var el = createHTML(template());

    // FIXME vuejs does not like to interact this way.. either it declines @focus or items
    /* this.vm = new Vue({
                el: el,
                // template: template(),
                data: this.data,
                methods: {
                  onStartClick: function (e) {
                    // alert('start');
                  }
                }
              });
              this.el.append(this.vm.$el);
          */
    this.el.append(el);

    // fix vue bug meanwhile use refs for bindings
    let params = el.querySelectorAll(['[ref]']).toArray();
    let refs = _.reduce(params, function (obj, param) {
      obj[param.getAttribute('ref')] = param;
      return obj;
    }, {});

    // var prevTween;
    var prevAnimation;

    function zoomToPos (targetCamera, controls, meshDetails) {
      // if (prevTween) prevTween.stop();

      if (prevAnimation) prevAnimation.stop();

      // var position = new THREE.Vector3(_.random(1, 20) / 10, _.random(1, 20) / 10, _.random(1, 20) / 10);
      window.ooo = meshDetails;

      // console.error('mesh', meshDetails);
      var position = meshDetails.relativePosition.clone();
      let dir = getWorldDirection(meshDetails.mesh);

      position.multiply(meshDetails.mesh.scale);
      position.multiplyScalar(0.1);
      // position.add(dir);

      console.error('zoomTo', position);
      // controls.target.copy(position);
      // controls.update();

      prevAnimation = AnimationFactory({position: targetCamera.position});
      prevAnimation.animate({position}, 400, function onComplete () { }, function onUpdate (...args) { controls.update(); });
    }

    function getMesh (o) {
      let els = document.querySelectorAll(o.selector).toArray();

      if (o.part == undefined) o.part = '.Mesh';

      // console.log(o.selector, '---', o.part);

      let subQueryResult = querySelectorAll(els[0], o.part);

      // --------

      // console.log('getMesh positions', getWorldPosition(els[0].object3D), getWorldPosition(subQueryResult[0]));
      // let relativePosition = getWorldPosition(els[0].object3D).sub(getWorldPosition(subQueryResult[0]));

      // let relativePosition = els[0].object3D.getWorldPosition().sub(subQueryResult[0].getWorldPosition());

      // FIXME only the bounding box does hold distinct vecotrs about position mesh.position is the same for every one of them
      let relativePosition = subQueryResult[0].geometry.boundingSphere.center.clone();

      // -----
      // console.log('relativePosition', relativePosition);
      return {mesh: subQueryResult[0], relativePosition};
    }

    // TODO use ZoomHelper(other repo) for better usability and performance
    // TODO it should be possible to get the result of a selection of the list view this wa
    // list view component should probably have some default emtters for change and selected
    // selected is not emitted the same way change is (change is working)

    refs.listview.addEventListener('selected', ({detail}) => {
      let meshDetails = getMesh(detail);

      let targetCamera = refs.sphere.getObject3D('touch-rotate-controls-camera');

      let targetControls = refs.sphere.components['touch-rotate-controls'].mControls;
      window.oooo = targetControls;

      zoomToPos(targetCamera, targetControls, meshDetails);
    });
  }

});
