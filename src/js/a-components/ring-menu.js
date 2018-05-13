/**
 * simple ring menu like it is used in fallout 4
 * left right rotates current layer of items
 * up down goes up/down one hierarchy
 *
 *
 */

import $ from 'jquery';
import {onElementChange} from '../utils/listener-utils';
import * as _ from 'lodash';

AFRAME.registerComponent('ring-menu', {
  schema: {
    selected: {type: 'number', default: 0},
    menu: {
      default: {
        'm1': {n1: {}, n2: {}, n3: {}, n4: {}, n5: {}},
        'm2': {o1: {}, o2: {q1: {}, q2: {}, q3: {}}, o3: {}},
        'm3': {p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {}},
        'm4': {},
        'm5': {},
        'm6': {},
        'm7': {}
      }
    },
    isRoot: {type: 'boolean', default: true},
    isActive: {type: 'boolean', default: true}

  },
  gotoSelection: function () {
    var count = Object.keys(this.data.menu).length;
    var rotate = -this.data.selected / count * 360 + 180;
    console.log(this.data.selected, rotate);
    this.el.setAttribute('animation__selectNextMenuEntry', `property: rotation;  to: 0 ${rotate} 0; dur: 300; easing: easeInOutCubic;`);

    var evt = new Event('changed');
    this.el.dispatchEvent(evt);
  },
  getSelection: function () {
    var keys = Object.keys(this.data.menu);
    var count = keys.length;
    var index = this.data.selected % count;

    if (index < 0) index += count;

    console.log('index', index);
    console.log('keys', keys);
    var res = this.data.menu[keys[index]];
    console.log('index-data', res);
    return res;
  },

  init: function () {
    $(this.el).on('selected', function () {
      console.log('ringmenu clicked', arguments);
    });

    this.menuEl = $('<a-cylinder radius="3" color="green" open-ended="true" material="side:double;transparent:true;opacity:0.2"></a-cylinder>').get(0);
    $(this.el).append(this.menuEl);

    // TODO do we need a live menu?
    /* onElementChange(this.el, '*', (...args) => {
                          console.log('onElementChange', args);
                          this.update();
                        }); */

    var count = Object.keys(this.data.menu).length;

    // TODO bind to ring menu state
    // TODO have esc to be bound to an action that sets state to default
    /*   State('menu')('player-move-backward', () => {

                                }); */

    // TODO refactor action names or have other way to use categories states to separate actions, have aliases maybe
    window.addEventListener('player-strafe-left', (e) => {
      if (!this.data.isActive) return;
      if (e.detail.first) return;
      //  this.data.selected = (this.data.selected + 1) % count;

      this.data.selected--;
      this.gotoSelection();
    });

    window.addEventListener('player-strafe-right', (e) => {
      if (!this.data.isActive) return;
      if (e.detail.first) return;
      // this.data.selected = (this.data.selected - 1 + count) % count;
      this.data.selected++;
      this.gotoSelection();
    });

    window.addEventListener('player-move-forward', (e) => {
      if (e.detail.first) return;

      // if (selection has child elements) then create next floor

      var subMenuData = this.getSelection();
      console.log('subMenuData', subMenuData);
      if (Object.keys(subMenuData).length <= 0) return;

      if (!this.data.isActive) return;
      this.data.isActive = false;

      var subMenu = $("<a-entity ring-menu='isRoot:false'   position='0 1 0'></a-entity>");
      subMenu.get(0).setAttribute('ring-menu', {menu: subMenuData});

      // el or menuEl

      $(this.el).append(subMenu);
      this.el.setAttribute('animation__moveOneLayer', `property: position;  to: 0 -1 0; dur: 300; easing: easeInOutCubic;`);
    });

    window.addEventListener('player-move-backward', (e) => {
      if (!this.data.isActive) return;
      if (this.data.isRoot) return;
      if (e.detail.first) return;

      console.log('go back', e, this);

      // this.data.isActive = false;
      // if (selection has child elements) then create next floor
      // $(this.el).append("<a-entity ring-menu='isRoot:false'  position='0 1 0'></a-entity>");
      this.el.parentEl.setAttribute('animation__moveOneLayer', `property: position;  to: 0 0 0; dur: 300; easing: easeInOutCubic;`);
      this.el.parentEl.components['ring-menu'].data.isActive = true;

      this.el.removeAttribute('ring-menu');
      $(this.el).remove();

      // this.data.isActive = false;
    });
  },
  remove () {
    console.log('remove', this.menuEl);
    this.el.removeChild(this.menuEl);
  },

  update: function () {
    // for each child elements align in circle
    // for each child of a child hide

    function doRecursion (parent, childrenObject) {
      var hasChildElements = Object.keys(childrenObject).length > 0;

      if (hasChildElements) {
        parent.append('<a-triangle position="0 1 0" scale="0.5 0.5 0.5"></a-triangle>');
      }
    }

    $(this.menuEl).children().each(function () {

    });

    var radius = 3;

    var count = Object.keys(this.data.menu).length;

    var step = Math.PI * 2 / count;

    for (let i = 0; i < count; i++) {
      var x = _.round(Math.sin(i * step) * radius, 4);

      var z = _.round(Math.cos(i * step) * radius, 4);

      let item = $('<a-plane class="menu-item" look-at="src:[camera]">');
      item.get(0).setAttribute('position', {x, y: 0, z});

      var txt = Object.keys(this.data.menu)[i];
      item.append(`<a-text value='${txt}'></a-text>`);

      item.on('click', (event) => {
        var evt = new Event('selected');
        this.el.dispatchEvent(evt);
      });

      $(this.menuEl).append(item);

      doRecursion(item, this.data.menu[txt]);
    }

    this.gotoSelection();
  }

})
;
