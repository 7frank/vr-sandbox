import * as _ from 'lodash';

import {changeRelativeURLFromConfig} from '../../database-utils';

// TODO reuse the one in animation lib instead
var flatten = function (source, pathArray, result) {
  pathArray = (typeof pathArray === 'undefined') ? [] : pathArray;
  result = (typeof result === 'undefined') ? {} : result;
  var key, value, newKey;
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      key = i;
      value = source[i];
      pathArray.push(key);

      if (typeof value === 'object' && value !== null) {
        result = flatten(value, pathArray, result);
      } else {
        newKey = pathArray.join('.');
        result[newKey] = value;
      }
      pathArray.pop();
    }
  }
  return result;
};

/**
 * fixes some  relative URLs and stuff
 * @param region
 * @param i
 * @returns {*}
 */
export function convertRegionInfo (region, i = 0) {
  let defaults = {
    thumbnail: {id: ''},
    owner: {username: 'none'}
  };

  defaults = flatten(defaults);

  // TODO find out why merge does not work for properties with reactiveGetter (either VUE or Proxy could be responsible)
  // region.__ob__.value = _.merge(defaults, region.__ob__.value);
  _.each(defaults, (v, k) => { if (_.get(region, k) == undefined) _.set(region, k, v); });

  region.thumbnail.url = changeRelativeURLFromConfig(region.thumbnail.url);

  _.each(region.assets, (v, k) => v.src.url = changeRelativeURLFromConfig(v.src.url));

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
      default: 'regions {name data description dimensions position owner  { username   }   thumbnail {url name}   assets{ Type Name   src{     name     url    }   }   }'
    }
  },
  init: function () {
    this.el.setAttribute('ql-ds', this.data); // rest-ds

    // TODO make it easier to change underlying data
    // this.el.addEventListener('data-entry-change',

    this.el.addEventListener('data-change', (event) => {
      _.each(event.detail.items, (entry, i) => {
        event.detail.items[i] = {key: i, value: convertRegionInfo(entry.value)};

        global.result = event.detail.items;
      });
    });
  }
});
