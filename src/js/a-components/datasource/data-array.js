import ObservableArray from 'observable-array';
import * as _ from 'lodash';
window.o = ObservableArray;
/**
 * A simple observable array that emits a change event
 * TODO allow simple CRUD via setters?
 */

AFRAME.registerComponent('data-array', {
  schema: {items: {default: null},
    maxItemCount: {type: 'number', default: -1} // can be set when loading data arrays to hint how many values there are to come
  },
  init: function () {
    this.data.items = ObservableArray();
    this.data.items.on('change', (event) => {
      // map observable array! is used in case the array gets altered which would break functionality. like  when we use vue for the gui-list-view

      this.el.emit('data-change', {
        items: _.map(this.data.items, i => i),
        type: event.type,
        changes: event.values,
        maxItemCount: this.data.maxItemCount,
        event
      });
    });
  }
});
