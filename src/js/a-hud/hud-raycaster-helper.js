/**
 * @deprecated
 * attach this to a matching HTMLElement, (a-hud or [hud-hud])
 */
import * as _ from 'lodash';
import {getCursor} from '../game-utils';

console.error('fix hud raycaster, ortho camera aspect on resize,el.emit, ');
AFRAME.registerComponent('hud-raycaster-helper', {
  schema: {},
  init: function () {
    // var rc = document.querySelector('[raycaster]');// TODO this does not wait for a raycaster to be attached by another component

    // reference raycaster indirectly by cursor instead as there is a second raycaster for the hud in use
    var rc = this.el;// getCursor();

    if (!rc) {
      console.error('hud-raycaster-helper needs an entity with a raycaster to be able to inject hud interaction');
      return;
    }

    // intercept raycast and enable visibility for a moment
    var meshes = [], mStats = [];
    rc.addEventListener('before-raycast', () => {
      this.el.setAttribute('visible', true);

    /*  meshes = AFRAME.nk.querySelectorAll(this.el, '.Mesh');
      mStats = meshes.map((m, k) => [m.renderOrder, m.material.depthTest]);
      meshes.map(m => {
        m.renderOrder = 999;
        m.material.depthTest = false;
      }); */
    });
    rc.addEventListener('after-raycast', () => {
      this.el.setAttribute('visible', false);
      /*
      meshes.map((m, k) => {
        m.renderOrder = mStats[k][0];
        m.material.depthTest = mStats[k][1];
      });
      */
    });
  }
});
