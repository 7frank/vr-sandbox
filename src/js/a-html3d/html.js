
import 'three/examples/js/renderers/CSS3DRenderer';
import {THREEx} from './threex.htmlmixer';

import $ from 'jquery';

// import 'aframe-stereo-component';
import 'aframe-stereo-component/dist/aframe-stereo-component';
import 'aframe-html-shader/dist/aframe-html-shader';

// TODO change import to where it belongs
import 'aframe-textarea-component';
import 'aframe-material-snickell';
import 'aframe-daydream-controller-component';

/**
 *
 * resources:
 *  html-gl https://github.com/PixelsCommander/HTML-GL
 *  html2canvas
 *  aframe-html-shader https://github.com/mayognaise/aframe-html-shader
 *  aframe-stereo-component https://github.com/oscarmarinmiro/aframe-stereo-component
 *
 *  example usage: <a-entity simple-car position="0 1 -10"></a-entity>
 * FIXME the div that contains the actual html is detached evyr tick
 * also its not upddating from camera tone reason might be that the camera isn't repositioning
 *
 * NOTE: for side-by-side views:
 *      (1)  the least what we can achieve y is to render the html for the left eye and via html2canvas a copy for the right eye
 *        BUT there is a catch... this way only elements with a billboard effect can be rendered as this does not require a perspective correction
 *        what we could try to achieve is to render the image and then correct the skew and such for the second eye manually
 *
 *      html2canvas is already wrapped in the following component:  https://github.com/mayognaise/aframe-html-shader
 *      (so rendering the html itself is okish under the html2canvas restriction)
 *      but to be able to fully interact with the html we need to render the html element for one eye only and the html-canvas-entity only in the second/right scene
 *
 *
 *
 *
 *      (2)alternative  aframe-html-shader + dispatchEvent+ document.elementFromPoint
 *      https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
 *      this might be an option in case the dom element is behind another 3d element in which case it still would be visible without a proper raycasting /visiblity check and manual hiding
 *
 *
 *  user story: (1)frank wants a ring menu around the player with some dialogs like input config level select and idk some others so he can naviagte more easily through his content
 *      (2)if (2) is working he'd like to have a multi level ring menu whre y-axis represents the category and x-axis  the entries per category
 *
 *
 */

/**
 * FIXME
 * stereo creates planes but does not create a image of any dom element
 * html-3d does not render the html in place nor does the element get attached to dom
 *  * rendering does partially work but depending on the size of the browser window will change vertical position until it is no longer visible
 *
 *
 */

// var extendDeep = AFRAME.utils.extendDeep;

AFRAME.registerComponent('html-3d', {
  schema: {
    isBillboard: {type: 'boolean'}
  },

  init: function () {
    var el = this.el;
    var that = window.car = this;

    //  var car = new Car({el: this.el});
    //  this._car = car;

    this.model = new THREE.Object3D();// car.model();

    var scene = $('a-scene').get(0);
    // TODO
    var viewport = $('body').get(0);// scene;// .querySelector('canvas');

    window['oo'] = this;

    var test = $('a-html-3d').get(0);

    // FIXME something is wrong here

    var box = createHtmlMixer(null, /* test.querySelector(':first-child') */ viewport, scene.object3D, scene.camera, scene.renderer, this.model);
    window['box'] = box;
    /* setInterval(function () {
      $(viewport).append(box);
    }, 1000);
*/
    // Entity.
    el.setObject3D('mesh', this.model);
  },

  update: function () {

  },

  remove: function () {
    if (!this.model) {
      return;
    }
    this.el.removeObject3D('mesh');
  }
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

AFRAME.registerPrimitive('a-html-3d', utils.extendDeep({}, meshMixin, {
  defaultComponents: {
    'html-3d': {}
  },

  mappings: {
    //  src: 'obj-model.obj',
    //  mtl: 'obj-model.mtl'
    // billboard:
  }
}));

function createHtmlMixer (canvas, viewport, scene, camera, renderer, targetEl, billboard = true) {
  var box = $('<div id="html3d">').css({height: 6, width: 6});

  // FIXME is detached probably due to scene updates

  $(viewport).append(box);

  // example TODOO better impl
  /*
    box.$.on("click dblclick",function(event){

        var canvas=self.getRootCanvas()
        var viewport=canvas.getViewports()[0]
        viewport.__domEvents._onMouseEvent(event.type, event);
    }) */

  // box.resizable({ handles: 'n e s w' });

  box.html('<button>blabla mr freeman</button><br><button>blabla mr freeman</button>');

  //  var canvas = this.getRootCanvas();
  // var renderer = canvas.Renderer();
  // var viewport = canvas.getViewports()[0];

  var viewport = {$: $(viewport), options: {height: $(viewport).height(), width: $(viewport).width()}};

  var domElement = box.get(0);
  // var scene = canvas.Scene();
  // var camera = viewport.options.viewport.camera;

  // viewport.$.get(0).style.border="2px dotted yellow"

  var updateFcts	= [];
  var mixerContext;

  if (!viewport._html_mixer_) {
    /// ///////////////////////////////////////////////////////////////////////////////
    //		create THREEx.HtmlMixer						//
    /// ///////////////////////////////////////////////////////////////////////////////
    mixerContext = new THREEx.HtmlMixer.Context(renderer, scene, camera);

    // handle window resize for mixerContext
    viewport.$.on('resize', function () {
      mixerContext.rendererCss.setSize(viewport.options.width, viewport.options.height);
    });

    /// ///////////////////////////////////////////////////////////////////////////////
    //		mixerContext configuration and dom attachement
    /// ///////////////////////////////////////////////////////////////////////////////

    // override rendererCss with our renderer
    console.log('domelement', viewport.$.get(0));
    mixerContext.rendererCss = new THREE.CSS3DRenderer({domElement: viewport.$.get(0)});
    // mixerContext.rendererCss = new THREE.CSS3DRenderer({domElement: box.get(0)});

    // set up rendererCss
    var rendererCss		= mixerContext.rendererCss;
    rendererCss.setSize(viewport.options.width, viewport.options.height);

    /// ///////////////////////////////////////////////////////////////////////////////
    //		render the scene						//
    /// ///////////////////////////////////////////////////////////////////////////////
    // render the css3d
    updateFcts.push(function (delta, now) {
      mixerContext.update(delta, now);
      // FIXME
      // viewport.$.append(box);
    });

    viewport._html_mixer_ = window['mixer'] = mixerContext;
  } else { mixerContext = viewport._html_mixer_; }

  /// ///////////////////////////////////////////////////////////////////////////////
  //		create a Plane for THREEx.HtmlMixer				//
  /// ///////////////////////////////////////////////////////////////////////////////

  var boundingRect = domElement.getBoundingClientRect();
  console.log('boundingrect', boundingRect);
  // create the plane
  var mixerPlane	= new THREEx.HtmlMixer.Plane(mixerContext, domElement, {
    elementW: boundingRect.width,
    planeW: 1,
    planeH: boundingRect.height / boundingRect.width
  });

  mixerPlane.object3d.scale.multiplyScalar(20);
  // scene.add(mixerPlane.object3d);
  targetEl.add(mixerPlane.object3d);

  /*
        var geometry	= new THREE.TorusKnotGeometry(0.5-0.125, 0.125);
        var material	= new THREE.MeshNormalMaterial();
        var mesh	= new THREE.Mesh( geometry, material );
        mesh.position.set(+1,0,+0.5)
        this.options.THREE.add( mesh );

        var geometry	= new THREE.TorusKnotGeometry(0.5-0.125, 0.125);
        var material	= new THREE.MeshNormalMaterial();
        var mesh	= new THREE.Mesh( geometry, material );
        mesh.position.set(-1,0,-0.5)
        this.options.THREE.add( mesh );
    */

  /// ///////////////////////////////////////////////////////////////////////////////
  //		Make it move							//
  /// ///////////////////////////////////////////////////////////////////////////////

  // update it
  updateFcts.push(function (delta, now) {
    //	mixerPlane.object3d.position.z=-1
    // mixerPlane.object3d.rotation.y += Math.PI * 2 * delta * 0.1;
    // TODO
    // if (billboard == true) { mixerPlane.object3d.quaternion.copy(camera.quaternion); }
  });

  /// ///////////////////////////////////////////////////////////////////////////////
  //		loop runner							//
  /// ///////////////////////////////////////////////////////////////////////////////
  var lastTimeMsec = null;
  requestAnimationFrame(function animate (nowMsec) {
    // keep looping
    requestAnimationFrame(animate);

    // measure time
    lastTimeMsec	= lastTimeMsec || nowMsec - 1000 / 60;
    var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec	= nowMsec;
    // call each update function
    updateFcts.forEach(function (updateFn) {
      updateFn(deltaMsec / 1000, nowMsec / 1000);
    });
  });

  return box;
}
