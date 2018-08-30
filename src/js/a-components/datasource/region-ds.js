import * as _ from 'lodash';

import {config} from '../../../js/database-utils';

export function convertRegionInfoToThumbInfo (region, i = 0) {
  let content = region.data;
  let thumb = region.thumbnail;
  thumb = _.assignIn({}, thumb);

  if (!thumb) thumb = {id: ''};

  if (thumb.url) {
    thumb.url = config.url + thumb.url;
  }

  return thumb;
}

// --------------------------------------------

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
        event.detail.items[i] = {key: 'item' + i, value: convertRegionInfoToThumbInfo(entry.value)};
      });
    });
  }
});
