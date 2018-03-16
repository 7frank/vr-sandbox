
import './jbouncy-examples/shaders/ScreenSpaceShader';
import './jbouncy-examples/shaders/LODShader';
import './jbouncy-examples/shaders/DefaultShader';
import './jbouncy-examples/shaders/GridExampleShader';
import './jbouncy-examples/helpers/LODPlane';
import './jbouncy-examples/effects/ProjectedGridExample';
import './jbouncy-examples/effects/LODGridExample';
import {DEMO} from './jbouncy-examples/demo';

/**
 * A plane implementation.
 * Best use cases are water and infinite planes
 * TODO this probably works best if we make it a system so that whenever another region requests its own plane it would simply make changes to the existing one
 * TODO add custom texture
 *
 * maybe this way we also could define environments and weather that shift depending on the region
 *
 */

AFRAME.registerComponent('infinite-plane', {
  schema: {

  },
  init: function () {
    this.mPlane = new DEMO();

    this.mPlane.Initialize(this.el);
    //   this.mPlane.Resize( WINDOW.ms_Width, WINDOW.ms_Height );
  },
  tick: function (time, timeDelta) {
    this.mPlane.Update();
  }

});
