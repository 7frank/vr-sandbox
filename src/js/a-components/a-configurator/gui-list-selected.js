// take the elem its attached to and convert it into vue component
import * as _ from 'lodash';
import Vue from 'vue/dist/vue.esm';
import waitUntil from 'wait-until';

/**
 * creates a recursive proxy object that will return a default text if a key does not exist.
 *
 * TODO a gui-list-view and a gui-list-select should both have a src and a datasource attribute
 * - a source should be any other list or element that uses a data-array of some sort
 * - a datasource is an instance of a data-array component or any descendant of it.
 *
 * @param obj
 * @returns {Object}
 */

function getDefaultsProxy (obj = {}) {
  var handler = {
    get: function (target, name) {
      if (name in target) {
        // TODO potential error (typeof target[name] != 'symbol') => (typeof name != 'symbol'
        if (_.isObject(target[name]) && (typeof target[name] != 'symbol')) {
          return getDefaultsProxy(target[name]);
        } else {
          global.test = {target, name};
          return target[name];
        }
      } else {
        // FIXME render result if missing or throw error

        //  return '!' + name.toString();
      }
    }
  };

  var proxy = new Proxy(obj, handler);

  return proxy;
}

AFRAME.registerComponent('gui-list-selected', {
  dependencies: ['data-array'],
  schema: {
    events: {
      type: 'array',
      default: 'selected,change'
    },
    src: {
      type: 'string',
      default: ''
    }

  },
  init: function () {
    var target;
    waitUntil()
      .interval(200)
      .times(Infinity)
      .condition(() => {
        if (!this.data.src) return false;

        target = document.querySelector(this.data.src);
        return !!target;
      })
      .done((result) => {
        // (1) init vue  container
        var data = {};
        let dataProxy = getDefaultsProxy(data);

        let tpl = this.el.querySelector(':first-child');
        if (!tpl) {
          throw new Error('must have a child element defined for templating');
        }

        this.vm = new Vue({
          el: tpl,
          data: {key: -1, value: dataProxy},
          methods: {}
        });

        // (2) add event listeners to list
        // (3) update this.vm.$data.value when listview selection changes

        // TODO receive and render initial data

        this.data.events.forEach(evt =>
          target.addEventListener(evt, ({detail}) => {
            this.vm.$data.key = detail.key;
            // FIXME object assign?
            global.selected = detail.value;

            this.vm.$data.value = detail.value;
            // Object.assign(data, detail.value);
          })
        );
      });
  }
});
