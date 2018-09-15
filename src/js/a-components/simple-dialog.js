import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import * as _ from 'lodash';

AFRAME.registerComponent('simple-dialog', {
  schema: {
    caption: {type: 'string', default: 'hello dialog!'},
    ok: {type: 'string', default: 'Ok'}
  },
  init: function () {
    //  get innerHTML and use it as text caption

    if (this.el) {
      var parsed = this.el.innerHTML;
      this._parsed = parsed;
      if (parsed.length > 0) {
        console.log('parsed', parsed);
        this.data.caption = parsed;
      }
      this.el.innerHTML = '';
    }

    this.createDialog();
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
