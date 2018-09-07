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
/**
 * TODO instead of having a static datasource property for gui-list-view have a dynamic data-array this way the region-ds will be easier to configure
 *
 */
AFRAME.registerComponent('region-ds', {
  // dependencies: ['ql-ds'],
  schema: {

    src: {
      type: 'string',
      default: 'regions' //  "/region" //for rest-ds
    },
    query: {
      type: 'string',
      default: 'regions {name data description dimensions owner { username   }   thumbnail {url name}   assets{    src{     name     url    }   }   }'
    }
  },
  init: function () {
    this.el.setAttribute('ql-ds', this.data); // rest-ds

    // TODO make it easier to change underlying data
    // this.el.addEventListener('data-entry-change',

    this.el.addEventListener('data-change', (event) => {
      _.each(event.detail.items, (entry, i) => {
        event.detail.items[i] = {key: i, value: convertRegionInfoToThumbInfo(entry.value)};

        global.result = event.detail.items;
      });
    });
  }
});
