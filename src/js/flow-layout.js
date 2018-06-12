/**
 * FIXME this is a mess but a first start I guess :>
 * text isn't scaling as it should
 * scaling of containers isn't calculated as well
 *  *
 *
 *
 */

import $ from 'jquery';
import * as _ from 'lodash';
import {createHTML} from './utils/dom-utils';
import {onAttrChange, onElementChange} from './utils/listener-utils';

AFRAME.registerComponent('broken-flow-layout', {
  schema: {},
  init: function () {
    if (this.el.getAttribute('visible') == true) {
      flowExample(this.el);
    } else {
      var observer;
      observer = onAttrChange(this.el.parentNode, 'visible', () => {
        if (this.el.getAttribute('visible') == true) {
          flowExample(this.el);
          observer.disconnect();
        }
      });
    }
  }
});

/**
 * port of  jLayout Flow Layout - for three.js
 *
 *
 */

/*
var flowLayout = flow({
    alignment: 'center',
    items: [myComponent1, myComponent2, myComponent3,
            myComponent4, myComponent5]
});

flowLayout.layout()

*/

export const flow = function (options) {
  var my = {},
    that = {};

  my.hgap = typeof options.hgap === 'number' && !isNaN(options.hgap) ? options.hgap : 0.01;
  my.vgap = typeof options.vgap === 'number' && !isNaN(options.vgap) ? options.vgap : 0.01;
  my.items = options.items || [];
  my.alignment = (options.alignment && (options.alignment === 'center' || options.alignment === 'right' || options.alignment === 'left') && options.alignment) || 'left';

  that.items = function () {
    var r = [];
    Array.prototype.push.apply(r, my.items);
    return r;
  };

  function align (row, offset, rowSize, parentSize) {
    var location = {
        x: offset.x,
        y: offset.y
      },
      i = 0,
      len = row.length;

    switch (my.alignment) {
      case 'center':
        location.x += (my.hgap + parentSize.width - rowSize.width) / 2;
        break;
      case 'right':
        location.x += parentSize.width - rowSize.width + my.hgap;
        break;
    }

    for (; i < len; i += 1) {
      location.y = offset.y;
      row[i].bounds(location);
      row[i].doLayout();
      location.x += row[i].bounds().width + my.hgap;
    }
  }

  that.layout = function (container) {
    var parentSize = container.bounds(),
      insets = container.insets(),
      i = 0,
      len = my.items.length,
      itemSize,
      currentRow = [],
      rowSize = {
        width: 0,
        height: 0
      },
      offset = {
        x: insets.left,
        y: insets.top
      };

    parentSize.width -= insets.left + insets.right;
    parentSize.height -= insets.top + insets.bottom;

    for (; i < len; i += 1) {
      if (my.items[i].isVisible()) {
        itemSize = my.items[i].preferredSize();

        if ((rowSize.width + itemSize.width) > parentSize.width) {
          align(currentRow, offset, rowSize, parentSize);

          currentRow = [];
          offset.y += rowSize.height;
          offset.x = insets.left;
          rowSize.width = 0;
          rowSize.height = 0;
        }
        rowSize.height = Math.max(rowSize.height, itemSize.height + my.vgap);
        rowSize.width += itemSize.width + my.hgap;

        currentRow.push(my.items[i]);
      }
    }
    align(currentRow, offset, rowSize, parentSize);
    return container;
  };

  function typeLayout (type) {
    return function (container) {
      var i = 0,
        width = 0,
        height = 0,
        typeSize,
        firstComponent = false,
        insets = container.insets();

      for (; i < my.items.length; i += 1) {
        if (my.items[i].isVisible()) {
          typeSize = my.items[i][type + 'Size']();
          height = Math.max(height, typeSize.height);
          width += typeSize.width;
        }
      }

      return {
        'width': width + insets.left + insets.right + (my.items.length - 1) * my.hgap,
        'height': height + insets.top + insets.bottom
      };
    };
  }

  that.preferred = typeLayout('preferred');
  that.minimum = typeLayout('minimum');
  that.maximum = typeLayout('maximum');

  return that;
};

function filterTextNodesAndReplaceWithAText (container) {
  container = document.querySelector('#flow-test-menu');

  let textNodes = container.childNodes.toArray().filter(n => n.nodeType == 3);
  textNodes.forEach(n => {
    let text = _.trim(n.textContent); // .replace(/\s/g, '');
    if (text != '') {
      _.each(text.split(' '), t => container.insertBefore(createHTML(`<a-text  width=0.4 height="0.2" value="${t}"></a-text>`), n));
    }
    // remove the textNode
    container.removeChild(n);
  });
}

window.flow = flow;
const jqWrap = function (el) {
  return wrap($(el), false);
};
window.jqWrap = jqWrap;

function flowExample (container) {
  if (!container) {
    container = document.querySelector('#flow-test-menu');
  }

  filterTextNodesAndReplaceWithAText(container);

  let btns = container.childNodes.toArray().filter(n => n.nodeType != 3);
  let items = _.map(btns, (btn) => jqWrap(btn, false));
  let f = flow({
    alignment: 'left',
    items: items
  });
  // console.log(items);
  // wait for text nodes to be ready
  setTimeout(() => f.layout(jqWrap(container, false)), 10);
}

window.flowExample = flowExample;

// -----------------------------------
/**
 * This wraps jQuery objects in another object that supplies
 * the methods required for the layout algorithms.
 *
 * let resize=false
 *  wrap(jQuery(htmlElement), resize);
 *
 */
export function wrap (item, resize) {
  var that = {};
  let self = item.get(0);
  // --------------------
  item.padding = () => ({bottom: 0, top: 0, left: 0, right: 0});
  item.border = () => ({bottom: 0, top: 0, left: 0, right: 0});
  item.margin = () => ({bottom: 0, top: 0, left: 0, right: 0});

  // TODO scale should be: left +- /width * scale

  item.position = function () {
    let pos = item.get(0).object3D.position;
    // let scale = item.get(0).object3D.scale;
    return {left: pos.x, top: pos.y};
  };
  //  fromCSS
  item.fromCSS = function ({left = 0, top = 0, width, height}) {
    let parentTODOoffset = 0.5;

    // console.log('fromCSS', arguments[0]);
    let pos = self.object3D.position;

    // TODO

    self.setAttribute('width', width);

    /* if (self.tagName != 'A-TEXT') {
      self.setAttribute('height', height);
    } */

    if (width == undefined) width = 0.1;
    if (height == undefined) height = 0.1;

    pos.y = -(top + height / 2 - parentTODOoffset);// left;
    pos.x = left + width / 2 - parentTODOoffset;// top;
  };

  // width height outerWidth outerHeight(includeMargin=false)

  item.width = function () {
    // return _.random(0, 10) / 10;

  /*  if (self.tagName == 'A-TEXT') {
      return self.components.text.data.value.length * 0.1;
    } */

    if (!self.hasAttribute('width')) return 0.01;// eslint-disable-line no-unreachable

    let val = self.getAttribute('width');

    return parseFloat(val) || 0.01;
  };

  item.height = function () {
    /* if (self.tagName == 'A-TEXT') {
          return 0.1;
        } */

    // return _.random(0, 10) / 10;
    if (!self.hasAttribute('height')) return 0.01;// eslint-disable-line no-unreachable

    let val = self.getAttribute('height');

    return parseFloat(val) || 0.01;
  };

  // TODO
  item.outerWidth = function (includeMargin) {
    return item.width();
  };
  item.outerHeight = function (includeMargin) {
    return item.height();
  };

  // ------------------

  $.each(['min', 'max'], function (i, name) {
    that[name + 'imumSize'] = function (value) {
      var l = item.data('jlayout');

      if (l) {
        return l[name + 'imum'](that);
      } else {
        return item[name + 'Size'](value);
      }
    };
  });

  $.extend(that, {
    doLayout: function () {
      var l = item.data('jlayout');

      if (l) {
        l.layout(that);
      }
      // item.css({position: 'absolute'});
    },
    isVisible: function () {
      return item.attr('visible');
    },
    insets: function () {
      var p = item.padding(),
        b = item.border();

      return {
        'top': p.top,
        'bottom': p.bottom + b.bottom + b.top,
        'left': p.left,
        'right': p.right + b.right + b.left
      };
    },
    bounds: function (value) {
      var tmp = {};
      // console.warn('!', value);
      if (value) {
        if (typeof value.x === 'number') {
          tmp.left = value.x;
        }
        if (typeof value.y === 'number') {
          tmp.top = value.y;
        }
        if (typeof value.width === 'number') {
          tmp.width = (value.width - (item.outerWidth(true) - item.width()));
          tmp.width = (tmp.width >= 0) ? tmp.width : 0;
        } else { // TODO
          tmp.width = item.width();
        }

        if (typeof value.height === 'number') {
          tmp.height = value.height - (item.outerHeight(true) - item.height());
          tmp.height = (tmp.height >= 0) ? tmp.height : 0;
        } else { // TODO
          tmp.height = item.height();
        }

        item.fromCSS(tmp);
        return item;
      } else {
        tmp = item.position();

        /* if (self.tagName == 'A-TEXT') {
          return {
            'x': tmp.left,
            'y': tmp.top,
            'width': item.outerWidth(false) / 10,
            'height': item.outerHeight(false)
          };
        } else { */
        return {
          'x': tmp.left,
          'y': tmp.top,
          'width': item.outerWidth(false),
          'height': item.outerHeight(false)
        };
      }
    },
    preferredSize: function () {
      var minSize,
        maxSize,
        margin = item.margin(),
        size = {width: 0, height: 0},
        l = item.data('jlayout');

      if (l && resize) {
        size = l.preferred(that);

        minSize = that.minimumSize();
        maxSize = that.maximumSize();

        size.width += margin.left + margin.right;
        size.height += margin.top + margin.bottom;

        if (size.width < minSize.width || size.height < minSize.height) {
          size.width = Math.max(size.width, minSize.width);
          size.height = Math.max(size.height, minSize.height);
        } else if (size.width > maxSize.width || size.height > maxSize.height) {
          size.width = Math.min(size.width, maxSize.width);
          size.height = Math.min(size.height, maxSize.height);
        }
      } else {
        size = that.bounds();
        size.width += margin.left + margin.right;
        size.height += margin.top + margin.bottom;
      }
      return size;
    }
  });
  return that;
}

// -------------------------------
/*
$.fn.layout = function (options) {
    var opts = $.extend({}, $.fn.layout.defaults, options);
    return $.each(this, function () {
        var element = $(this),
            o = ( element.data('layout') ) ? $.extend(opts, element.data('layout')) : opts,
            elementWrapper = wrap(element, o.resize);

       if (o.type === 'flow' && typeof jLayout.flow !== 'undefined') {
            o.items = [];
            element.children().each(function (i) {
                if (!$(this).hasClass('ui-resizable-handle')) {
                    o.items[i] = wrap($(this));
                }
            });
            element.data('jlayout', jLayout.flow(o));
        }

        if (o.resize) {
            elementWrapper.bounds(elementWrapper.preferredSize());
        }

        elementWrapper.doLayout();

    });
};

*/
