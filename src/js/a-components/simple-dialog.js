import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';

AFRAME.registerComponent('simple-dialog', {
  schema: {
    caption: {type: 'string', default: 'hello dialog!'},
    ok: {type: 'string', default: 'Ok'}
  },
  init: function () {
    var that = this;
    var el = createHTML(
      `<a-rounded  material="opacity:.9" width="4" height="3" radius="0.1" >
                <a-form >
                
                <a-text width="3.6"  position="0.2 2.6 0.05" :value="caption"></a-text>
                        
                   <!-- <a-switch id="editableActorBtn" value="createEditableActor" position="0.2 2.7 0" enabled="true"></a-switch>
                    <a-radio position="0.2 2.4 0" width="3" name="food" label="Burger with fries and pizza" value="pizza"></a-radio>
                    <a-radio position="0.2 2.1 0" width="3" name="food" label="Veggies" checked="true" disabled="true"></a-radio>
                    <a-radio position="0.2 1.8 0" width="3" name="food" label="Ice cream"></a-radio>
                    <a-checkbox position="0.2 1.5 0" width="3" name="stuff" label="I am a checkbox" checked="true"></a-checkbox>
                    <a-checkbox position="0.2 1.2 0" width="3" name="stuff" label="And I am another one" checked="true" disabled="true"></a-checkbox>
                    -->
                    <a-button @interaction-pick.stop="onOkClick" @click.stop="onOkClick" position="0.2 0.6 0" name="stuff" :value="ok" type="raised"></a-button>
                    <!--<a-button position="0.2 0.35 0" width="3" name="stuff" value="You cannot click me" disabled="true"></a-button> -->
                </a-form>
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
  }

});
