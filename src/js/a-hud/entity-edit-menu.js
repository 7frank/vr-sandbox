import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import template from './entity-edit-menu.hbs';
import {showMenu} from '../utils/debug-gui';
import * as _ from 'lodash';

import {querySelectorAll} from '../utils/selector-utils';
import {getWorldDirection, getWorldPosition} from '../utils/aframe-utils';
import ZoomUtil from '../utils/ZoomUtils';
import {AnimationFactory} from '../utils/animation-utils';

// ---------------------------------
// var prevTween;
var prevAnimation;
window.o = new THREE.Vector3();

// FIXME not working.. disable touchrotate controls before debugging
function zoomToPos (targetCamera, controls, meshDetails) {
  if (prevAnimation) prevAnimation.stop();
  var targetPosition = meshDetails.relativePosition.clone();
  console.log('zoomTo orig', targetPosition);
  targetPosition.multiply(meshDetails.mesh.scale);

  let distance = meshDetails.radius * meshDetails.mesh.scale.length() * 2;

  // TODO not working with the bike model ads its positions are not relative but absolute
  //    let dir = getWorldDirection(meshDetails.mesh);
  // position.multiplyScalar(0.1);
  //   position.add(dir);

  let newCameraPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, 1));

  console.log('zoomTo', targetPosition);

  prevAnimation = ZoomUtil.moveToPosition(newCameraPosition, targetCamera, targetPosition, distance, undefined, (...args) => {
    controls.update();
  });
}

function moveObjectToPosition (obj3d, targetPos) {
  let prevAnimation = AnimationFactory({position: obj3d.position});
  prevAnimation.animate({position: targetPos}, 400);
}

/**
 * query for a object3d and then for a specific part within it
 * @param o
 * @returns {*}
 */

function getMesh (o) {
  let els = document.querySelectorAll(o.selector).toArray();

  if (els.length == 0) return null; //

  if (o.part == undefined) o.part = '.Mesh';

  // console.log(o.selector, '---', o.part);

  let subQueryResult = querySelectorAll(els[0], o.part);

  return subQueryResult[0];
}

// ---------------------------------

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

    // TODO list view component should probably have some default emitters for change and selected
    // selected is not emitted the same way change is (change is working)

    refs.listview.addEventListener('selected', ({detail}) => {
      /* let meshDetails = getMesh(detail);

                  let targetCamera = refs.sphere.getObject3D('touch-rotate-controls-camera');
                  let targetControls = refs.sphere.components['touch-rotate-controls'].mControls;
                  zoomToPos(targetCamera, targetControls, meshDetails, refs.preview.object3D);
                  */

      let mesh = getMesh(detail);
      if (mesh) {
        let relativePosition = mesh.geometry.boundingSphere.center.clone();
        console.log('actual position', relativePosition);
      }

      // window.move = (pos) => moveObjectToPosition(refs.preview.object3D, AFRAME.utils.coordinates.parse(pos));

      if (detail.position) {
        let pos = AFRAME.utils.coordinates.parse(detail.position);
        console.log('zoom to', pos);

        // TODO use sphere instead but that is currently controlled by touch-rotate-controls
        moveObjectToPosition(refs.preview.object3D, pos);
      } else console.log("can't zoom to pos position not found in data");
    });
  }

});
