import * as _ from 'lodash';
import {convertRegionInfoToThumbInfo} from '../../database-utils';

AFRAME.registerComponent('region-ds', {
  dependencies: ['rest-ds'],
  schema: {

    src: {
      type: 'string',
      default: '/region'
    }

  },
  init: function () {
    this.el.setAttribute('rest-ds', this.data);

    // TODO make it easier to change underlying data
    // this.el.addEventListener('data-entry-change',

    this.el.addEventListener('data-change', (event) => {
      _.each(event.detail.items, (entry, i) => {
        event.detail.items[i] = {key: i, value: convertRegionInfoToThumbInfo(entry.value)};
      });
    });
  }
});
