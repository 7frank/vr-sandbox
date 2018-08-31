import * as _ from 'lodash';

import {config} from '../../../js/database-utils';

export function convertRegionInfoToThumbInfo (region, i = 0) {
  let content = region.data;
  let thumb = region.thumbnail;

  thumb = _.assignIn({id: ''}, thumb);

  if (thumb.url && !_.startsWith(thumb.url, config.url)) {
    thumb.url = config.url + thumb.url;

    region.thumbnail = thumb;
  } else { region.thumbnail = thumb; }

  return region;
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
        event.detail.items[i] = {key: i, value: convertRegionInfoToThumbInfo(entry.value)};
      });
    });
  }
});
