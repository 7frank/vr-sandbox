import 'aframe-material-collection';
import {createHTML} from '../../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {getPlayer, getScene} from '../../game-utils';

const dialog = `
<a-plane id="modalPanel" ui-curved-plane width="4.4444" height="2" scale="0.0001 0.0001 0.0001" position="0 0 -1.7" side="double" shader="flat" class="intersect"></a-plane>

<a-ui-renderer id="modalRenderer" ui-panel="#modalPanel">
    <a-entity geometry="primitive:plane;width:4.222;height:1.9;" material="side:double;shader:flat;" position="0 1 -0.495">

        <a-plane width="0.15" height="0.15" position="1.105 0.515 0.001" color="#fff" shader="flat"
                 class="intersectable close-modal">
            <a-plane src="icons/close_white_18dp.png" width="0.08" height="0.08" shader="flat" transparent="true" color="#4db6ac"></a-plane>
        </a-plane>
        <a-ui-scroll-pane id="modalContent" handle-color="#4db6ac" position="0 -0.05 0.01" width="2" height="0.9" look-controls-el="#camera" look-controls-component="">
            <a-entity class="container">
                <!--Introduction-->
                <a-entity width="1.8">
                    <a-text font="roboto" baseLine="center" value="Modal Popup"
                            color="#212121" anchor="center" wrap-count="28" width="1.9" height="0.15"></a-text>

                    <a-text font="roboto" baseLine="center" value="This modal's content is rendered separately from the rest of the scene - only when its opened."
                            anchor="center" color="#515151" wrap-count="40" width="1.9" height="0.2"></a-text>

                    <a-text font="roboto" baseLine="center" value="Backdrop"
                            color="#212121" anchor="center" wrap-count="28" width="1.9" height="0.15"></a-text>

                    <a-text font="roboto" baseLine="center" value="The backdrop is created by pausing the underlying renderer - this means it does not render or respond to input while the modal is opened. It also has a nice fade animation on the backdrop before rendering is paused."
                            anchor="center" color="#515151" wrap-count="40" width="1.9" height="0.45"></a-text>


                    <a-entity width="1.3">
                        <!--Flat Button-->
                        <a-ui-button class="intersectable close-modal" text-value="Close" transparent="true"
                                     font-color="#009688" color="white" ripple-color="#009688"></a-ui-button>
                    </a-entity>

                    <a-entity width="0.3">
                        <!--Button-->
                        <a-ui-button class="intersectable close-modal" text-value="OK" ></a-ui-button>
                    </a-entity>
                </a-entity>
            </a-entity>
        </a-ui-scroll-pane>
    </a-entity>
</a-ui-renderer>

<a-plane id="uiPanelTwo" ui-curved-plane width="6" height="3" position="0 0 -2" side="double" shader="flat" class="intersect"></a-plane>
<a-ui-renderer id="mainRenderer" ui-panel="#uiPanelTwo">

    <a-entity position="0 0 -0.69" id="uiPanel" >

        <!-- Toast Message -->
        <a-ui-toast id="toastMessage" position="1 -0.4 0.1" visible="false"></a-ui-toast>

        <!-- Scroll Pane -->
        <a-text font="roboto" baseLine="bottom" value="Aframe Material Collection"
                position="-1.4 0.6 0.005" color="#212121" wrap-count="25" width="1.25" height="0.25"></a-text>

        <a-plane class="intersectable" width="3.4" height="1.7" position="0 0 -0.02" shader="flat" color="#cfcfcf" side="double"></a-plane>

        <a-ui-scroll-pane position="0 -0.1 0" scroll-z-offset="0.001" look-controls-el="#camera">
            <a-entity class="container">
                <!--Introduction-->
                <a-entity width="2.9">
                    <a-text font="roboto" baseLine="center" value="Introduction"
                            color="#212121" anchor="center" alpha-test="0.3" wrap-count="54" width="2.45" height="0.1"></a-text>

                    <a-text font="roboto" baseLine="bottom" value="Here we have some material UI based primitives and components for use in your aframe projects."
                            anchor="center" color="#515151" alpha-test="0.3" wrap-count="80" width="2.85" height="0.15"></a-text>

                    <a-text id="getwidth" font="roboto" baseLine="center" anchor="center" value="Scroll Pane"
                            color="#212121" wrap-count="54" alpha-test="0.3" width="2" height="0.1"></a-text>

                    <a-text font="roboto" baseLine="center" value="All of these primitive elements are enclosed inside a scroll pane. Elements out of view are automatically clipped."
                            anchor="center" color="#515151" alpha-test="0.3" wrap-count="80" width="2.9" height="0.15"></a-text>
                </a-entity>

                <!-- Left Panel -->
                <a-entity width="1.35">

                    <!--Renderer-->
                    <a-entity width="1.25">
                        <a-text id="getwidth" font="roboto" baseLine="center" anchor="center" value="UI Renderer"
                                color="#212121" wrap-count="27" width="1" height="0.2"></a-text>

                        <a-text font="roboto" baseLine="center"
                                value="The objects contained within the renderer entity are removed from the main scene and then rendered only when things change using the inbuilt change detection system."
                                anchor="center" color="#515151" wrap-count="35" width="1.26875" height="0.2"></a-text>
                    </a-entity>

                    <!--Ripple-->
                    <a-entity width="1.25">

                        <a-text font="roboto" baseLine="bottom" value="Ripple"
                                color="#212121" anchor="center" wrap-count="25" width="1.25" height="0.2"></a-text>

                        <a-plane class="intersectable" shader="flat" width="0.25" height="0.2"
                                 color="#673ab7" ui-ripple="size:0.25 0.2;clampToSquare:true;zIndex:0.001;color:white;"></a-plane>

                        <a-triangle class="intersectable" shader="flat" vertex-a="0 0.075 0" vertex-b="-0.075 -0.075 0" vertex-c="0.075 -0.075 0"
                                    color="#ec407a" ui-ripple="size:0.15 0.15;zIndex:-0.001;color:#f48fb1; duration:500;fadeDuration:250;"  width="0.25" height="0.2"></a-triangle>
                    </a-entity>

                    <!-- Buttons -->
                    <a-entity position="0 -2 0" width="1.25">

                        <a-text font="roboto" baseLine="center" value="Buttons"
                                color="#212121" anchor="center" wrap-count="25" width="1.25" height="0.1"></a-text>

                        <!--Button-->
                        <a-ui-button class="intersectable" text-value="Button" ></a-ui-button>

                        <!--Flat Button-->
                        <a-ui-button class="intersectable" text-value="Flat Button" transparent="true"
                                     font-color="#009688" color="white" ripple-color="#009688"></a-ui-button>

                        <!--Disabled Button-->
                        <a-ui-button class="intersectable" text-value="Disabled" disabled="true" transparent="true"
                                     font-color="#cfcfcf" color="#efefef" ripple-color="#cfcfcf"></a-ui-button>


                        <a-text font="roboto" baseLine="center" value="Floating Action Buttons"
                                color="#212121" anchor="center" wrap-count="25" width="1.25" height="0.15"></a-text>

                        <!--Floating Action Button-->
                        <a-ui-fab-button class="intersectable" color="#f44336"></a-ui-fab-button>

                        <!--Floating Action Button Small-->
                        <a-ui-fab-button-small class="intersectable" color="#2196f3"></a-ui-fab-button-small>

                        <!--Floating Action Button Disabled-->
                        <a-ui-fab-button-small class="intersectable" disabled="true"
                                               color="#afafaf" ripple-color="#afafaf"></a-ui-fab-button-small>


                        <a-text font="roboto" baseLine="center" value="Modal"
                                color="#212121" anchor="center" wrap-count="25" width="1.25" height="0.15"></a-text>

                        <!--Modal Button-->
                        <a-ui-button class="intersectable" text-value="Open Modal" wrap-count="12"
                                     ui-modal="modal:#modalRenderer;main:#mainRenderer;"></a-ui-button>


                        <a-text font="roboto" baseLine="center" value="Color Picker"
                                color="#212121" anchor="center" wrap-count="25" width="1.25" height="0.15"></a-text>

                        <!--Color Picker Button-->
                        <a-ui-button id="pickColor" class="intersectable" text-value="Pick Color" wrap-count="12">

                        </a-ui-button>
                    </a-entity>



                </a-entity>

                <!-- Right Panel -->
                <a-entity width="1.35">

                    <!--Text Input-->
                    <a-entity width="1.25">
                        <a-text font="roboto" baseLine="center" anchor="center" value="Text"
                                color="#212121" wrap-count="25" width="0.9" height="0.1"></a-text>
                        <a-ui-input-text camera-el="#camera" width="1" height="0.2"
                                         value=""

                        ></a-ui-input-text>
                        <!--Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in quam dui.-->
                    </a-entity>

                    <!--Number Input-->
                    <a-entity width="1.25">
                        <a-text font="roboto" baseLine="center" anchor="center" value="Number"
                                color="#212121" wrap-count="25" width="0.9" height="0.1"></a-text>

                        <a-ui-input-text camera-el="#camera" width="1" height="0.2" type="number"
                                         value="0.00" place-holder="Number..."></a-ui-input-text>

                    </a-entity>

                    <!--Int Input-->
                    <a-entity width="1.25">
                        <a-text font="roboto" baseLine="center" anchor="center" value="Integer"
                                color="#212121" wrap-count="25" width="1.25" height="0.1"></a-text>

                        <a-ui-input-text camera-el="#camera" width="1" height="0.2" type="int"
                                         value="10" place-holder="Whole Number..."></a-ui-input-text>
                    </a-entity>

                    <!--Switch-->
                    <a-entity width="1.25">

                        <a-text font="roboto" baseLine="center" anchor="center" value="Switch"
                                color="#212121" wrap-count="25" width="1.25" height="0.15"></a-text>
                        <a-ui-switch></a-ui-switch>

                        <a-ui-switch disabled="true"></a-ui-switch>

                    </a-entity>

                    <a-text font="roboto" baseLine="center" anchor="center" value="Checkbox"
                            color="#212121" wrap-count="25" width="1.25" height="0.1"></a-text>

                    <!--Checkbox-->
                    <a-entity width="1.25">
                        <a-ui-checkbox ></a-ui-checkbox>

                        <a-ui-checkbox value="true" ></a-ui-checkbox>

                        <a-ui-checkbox indeterminate="true" ></a-ui-checkbox>

                        <a-ui-checkbox disabled="true" ></a-ui-checkbox>
                    </a-entity>

                    <!--Radio Group-->
                    <a-entity width="1.25">
                        <a-text font="roboto" baseLine="center" anchor="center" value="Radio"
                                color="#212121" wrap-count="25" width="1.25" height="0.1"></a-text>
                        <a-ui-radio></a-ui-radio>
                        <a-ui-radio selected="true"></a-ui-radio>
                        <a-ui-radio></a-ui-radio>
                        <a-ui-radio disabled="true"></a-ui-radio>
                    </a-entity>

                    <a-entity width="1.25">

                        <a-text font="roboto" baseLine="center" value="Toast Message"
                                color="#212121" anchor="center" wrap-count="25" width="1.25" height="0.15"></a-text>

                        <!--Toast Button-->
                        <a-ui-button ui-toast="toastEl:#toastMessage;message:Im a toast message!" class="intersectable" text-value="Show Toast" wrap-count="12"></a-ui-button>

                        <!--Toast Button 2-->
                        <a-ui-button ui-toast="toastEl:#toastMessage;message:Hello World! Im a very long toast message toast toasty toast toasty toast toast toasty toast toasty toast toast!" class="intersectable" text-value="Show Toast 2" wrap-count="12"></a-ui-button>

                    </a-entity>

                </a-entity>
            </a-entity>
        </a-ui-scroll-pane>
    </a-entity>
    <a-entity ui-color-picker="targetEl:#pickColor" position="0 0.2 -0.55"></a-entity>
</a-ui-renderer>

`;

AFRAME.registerComponent('material-component-example', {
  schema: {
    caption: {type: 'string', default: 'hello dialog!'},
    ok: {type: 'string', default: 'Ok'}
  },
  init: function () {
    //  get innerHTML and use it as text caption

    getPlayer().querySelector('[cursor]').setAttribute('ui-mouse-shim', true);
    this.el.innerHTML = dialog;

    /*
     <a-entity id="camera" camera="near:0.1;far:10000"  look-controls wasd-controls>
        <a-entity id="cursor" cursor="rayOrigin: mouse" ui-mouse-shim
                  raycaster="far: 30; objects: .intersect;"></a-entity>
    </a-entity>
  */

    /*  if (this.el) {
            var parsed = this.el.innerHTML;
            this._parsed = parsed;
            if (parsed.length > 0) {
                console.log('parsed', parsed);
                this.data.caption = parsed;
            }
            this.el.innerHTML = '';
        }
*/
    // this.createDialog();
  },
  /* update: function (oldData) {
          if (caption.caption!=this.data.caption)
          this.createDialog();
      }, */

  createDialog: function () {
    if (this.vm) this.vm.$el.parentElement.removeChild(this.vm.$el);

    var that = this;
    var el = createHTML(
      `<a-rounded  material="opacity:.3;color:black;" width="4" height="3" radius="0.1" >
                
                
                <a-text width="3.6" height="2" position="0.3 2.4 0.05" :value="caption"></a-text>
                        
                   <!-- <a-switch id="editableActorBtn" value="createEditableActor" position="0.2 2.7 0" enabled="true"></a-switch>
                    <a-radio position="0.2 2.4 0" width="3" name="food" label="Burger with fries and pizza" value="pizza"></a-radio>
                    <a-radio position="0.2 2.1 0" width="3" name="food" label="Veggies" checked="true" disabled="true"></a-radio>
                    <a-radio position="0.2 1.8 0" width="3" name="food" label="Ice cream"></a-radio>
                    <a-checkbox position="0.2 1.5 0" width="3" name="stuff" label="I am a checkbox" checked="true"></a-checkbox>
                    <a-checkbox position="0.2 1.2 0" width="3" name="stuff" label="And I am another one" checked="true" disabled="true"></a-checkbox>
                    -->
                   
                   <a-button @interaction-pick.stop="onOkClick" @click.stop="onOkClick" position="0.2 0.6 0" name="stuff" :value="ok" type="raised"></a-button>
                  
                   <!--  <a-ui-button text-value="ok" class="intersectable" position="0.2 0.6 0.01"
                      @interaction-pick.stop="onOkClick" @click.stop="onOkClick"
                     ></a-ui-button> -->  
                   
                  
            </a-rounded>`
    );

    this.vm = new Vue({
      el: el,
      data: this.data,
      methods: {
        onOkClick: function (e) {
          that.el.parentElement.removeChild(that.el);
        }
      }
    });

    this.el.append(this.vm.$el);
  },
  remove: function () {
    this.el.innerHTML = this._parsed;
  }

});
