import $ from 'jquery';
import * as _ from 'lodash';
import 'aframe-gui/dist/aframe-gui';
import {FPSCtrl} from '../../utils/fps-utils';
import {toast} from '../../utils/aframe-utils';
// a list that contains template-containers to select them
// first lets have a simple select like in fallout 4
// goal is to select and place
// when placing the templates into the world we should use editable-actor

var templates = [
  {name: 'helloTemplate', template: '<a-box></a-box>'},
  {name: 'helloText', template: '<a-text value="{{text:string}}"></a-text>'},
  {name: 'izzy', template: `<a-entity
          shadow="cast: true; receive: false"
          scale="0.008 0.008 0.008"
          --behaviour-attraction="speed:0.5"
          animation-mixer="clip: *;"
          gltf-model="src: url(assets/models/Izzy/scene.gltf);">
    </a-entity>`},
  {name: 'animatedBox', template: `<a-box src="#boxTexture" 
        position="0 0.5 0" 
        rotation="0 45 45" 
        scale="1 1 1" 
        material="color:red">
        <a-animation attribute="position" to="0 2 -1" direction="alternate" dur="2000"
            repeat="indefinite"></a-animation>
   </a-box>`}
];

var behaviourTemplates = {
  flee: 'behaviour-attraction="speed:-1.5"',
  engage: 'behaviour-attraction="speed:0.5"'
};

var instances = [];

AFRAME.registerComponent('template-library', {
  schema: {
    selected: {type: 'number', default: 0},
    templates: {type: 'array', default: templates}
  },

  init: function () {

  }

});

AFRAME.registerComponent('wireframe', {
  dependencies: ['material'],
  init: function () {
    if (this.el.components.material) { this.el.components.material.material.wireframe = true; } else { console.warn("Can't set wireframe. Does not have material."); }
  }
});

// -----------------------------------------

AFRAME.registerComponent('gui-list-view', {
  schema: {
    items: {type: 'array', default: []},
    itemFactory: {
      default: function (item) {
        return item;
      }}
  },

  init: function (HALPP = false) {
    // FIXME justify-content="center" breaks component
    // FIXME also  items are not aligned
    var containerTemplate = `
    <a-gui-flex-container align-items="normal"
       flex-direction="column"  
        component-padding="0.1"
        opacity="0.7"
        width="3.5"
        --height="4.5"
        position="0 0 0"
         rotation="0 0 0">
         
         <a-gui-label  width="3.2" height="0.5" value="Click to select then"></a-gui-label>
         <a-gui-label  width="3.2" height="0.5" value="click on region to"></a-gui-label>
         <a-gui-label  width="3.2" height="0.5" value="place element."></a-gui-label>
         
         
    </a-gui-flex-container>
    `;

    var wrapper = $(`<a-entity></a-entity>`);
    var preview = $(`<a-entity><a-box></a-box></a-entity>`);

    new FPSCtrl(30, function () {
      this.object3D.rotation.y += 0.01;
    }, preview.get(0)).start();

    var previewWrapper = $(`<a-entity position="3 0 0" ></a-entity>`);
    previewWrapper.append(preview);
    var container = $(containerTemplate);
    wrapper.append(container, previewWrapper);

    _.each(templates, function (tpl, key) {
      var key = tpl.name;
      tpl = tpl.template;

      function onRegionClick (event, tpl) {
        var targetEl = event.detail.intersectedEl;
        if (targetEl.components['editable-region']) {
          var targetPos = event.detail.intersection.point;
          targetPos.y += 1;
          var tplInstance = $(tpl);
          tplInstance.attr('position', AFRAME.utils.coordinates.stringify(targetPos));
          $(targetEl).append(tplInstance);
        } else {
          console.log('click a region to position the template. clicked:', targetEl);
          toast('Click a region to place the template.');
        }
      }

      function regionClickWrapper (e) {
        onRegionClick(e, tpl);
      }

      function getButtonEntity (btn) {
        btn = document.querySelectorAll('a-gui-button')[0].components['gui-button'];
        return btn.buttonEntity;
      }

      function highlightSingleButton (btn) {
        var parentEl = btn.parentEl;
        var btns = $(parentEl).children('a-gui-button');

        _.each(btns, function (_btn) {
          console.log('highlighting', _btn);
          var __button = _btn.components['gui-button'];

          var btnActive = (btn == _btn);

          /**
                     * in case the button is selected highlight and blur others if selected twice blur too
                     */
          if (btnActive) {
            __button.toggleState = !__button.toggleState;
            getButtonEntity(_btn).setAttribute('material', 'color', __button.data.activeColor);
          } else {
            getButtonEntity(_btn).setAttribute('material', 'color', __button.data.backgroundColor);
            __button.toggleState = false;
          }
        });
      }

      var btn = $(`<a-gui-button toggle="true" width="2.5" height="0.75" font-family="Arial" margin="0 0 0.05 0" value="${key}"></a-gui-button>`);

      // FIXME hover/mouseenter does neither work on container nor button
      btn.on('touch click', function () {
        preview.html('');
        var tplInstance = $(tpl);
        tplInstance.attr('material', 'transparent:true;opacity:0.3');
        preview.append(tplInstance);

        highlightSingleButton(btn.get(0));

        // enable region clicking and placing of tpl at position
        //  $('[cursor]').off('click', regionClickWrapper);
        //  $('[cursor]').on('click', regionClickWrapper);

        var regions = $('[editable-region]');
        _.each(regions, function (region) {
          region.setAttribute('template-droppable', true);
          // we need to inject data directly because it is in html notationand can't be added via setAttribute
          // TODO having something like region.setAttribute('template-droppable.template', tpl); would be nice
          region.components['template-droppable'].data.template = tpl;
        });
      });
      container.append(btn);
    });

    // note: wait to append otherwise items wont be aligned as component only aligns on init
    $(this.el).append(wrapper);

    // onmouseenter => focus
    // onmouseleave => blur
    // on player-move forward && hasFocus selected-=1
  }

});

// -----------------------------------------

AFRAME.registerComponent('template-preview', {
  schema: {
    template: {type: 'string'}
  },

  init: function () {

    // TODO list elements in a ring menu

  }

});

/**
 * the next click on the entity this component is bound it will create the template at the intersection point.
 *
 */

AFRAME.registerComponent('template-droppable', {
  schema: {
    accept: {type: 'selector', default: '*'},
    template: {type: 'string', default: '<a-sphere></a-sphere>'},
    removeOnDrop: {type: 'boolean', default: true},
    removable: {type: 'boolean', default: true},
    allowNestedDrop: {type: 'boolean', default: false}
  },

  init: function () {
    this.el.addEventListener('click', this.onClickTestAccept.bind(this));
  },
  remove: function () {
    this.el.removeEventListener('click', this.onClickTestAccept.bind(this));
  },
  onClickTestAccept: function (event) {
    var targetEl = this.el;

    if (!this.data.allowNestedDrop) {
      console.log(event.srcElement, targetEl);
      if (event.srcElement != targetEl) {
        toast('nested drop is disabled');
        return;
      }
    }
    toast('dropping template');

    console.log('dropping', event.detail, this);
    var targetPos = event.detail.intersection.point;
    targetPos.y += 1;

    targetPos.sub(this.el.object3D.position);

    var tplInstance = $(this.data.template);

    if (this.data.removable) {
      tplInstance.attr('template-removable', true);
    }

    tplInstance.attr('position', AFRAME.utils.coordinates.stringify(targetPos));
    $(targetEl).append(tplInstance);
  }

});

// TODO hotkeys action remove-entity bind to mouse-right
//  how would an implementation of that work
AFRAME.registerComponent('template-removable', {
  schema: {},

  init: function () {
    this.el.addEventListener('click', this.onRemoveEvent.bind(this));
  },
  remove: function () {
    this.el.removeEventListener('click', this.onRemoveEvent.bind(this));
  },
  onRemoveEvent: function (event) {
    event.stopPropagation();

    console.log('template-removable', arguments, this.data, event.detail.intersection);
    toast('template-removable');

    $(this.el).remove();
  }

});
