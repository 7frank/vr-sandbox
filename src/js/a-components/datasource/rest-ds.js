import * as _ from 'lodash';
import {queryAPI} from '../../database-utils';

/**
 * A simple REST - based data source.
 *
 * TODO have some more options
 *
 *
 */

AFRAME.registerComponent('rest-ds', {
  dependencies: ['data-array'],
  schema: {

    src: {
      type: 'string',
      default: '/user'
    }

  },
  init: function () {
    this.query();
  },
  update: function () {
    this.query();
  },
  query: function () {
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;

    if (this.data.src) {
      queryAPI(this.data.src).then(function (entries) {
        if (!_.isArray(entries)) {
          entries = [entries];
        }

        _.each(entries, (region, i) => {
          let mData = {key: i, value: region};
          console.log('mData', mData);
          observableDataArray.push(mData);
        });
      }).catch((event) => {
        this.el.emit('data-error', {
          items: _.map(this.data.items, i => i),
          type: event.type,
          changes: event.values,
          maxItemCount: this.data.maxItemCount,
          event
        });
      });
    }
  }

});
