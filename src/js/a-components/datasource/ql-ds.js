import * as _ from 'lodash';
import {DB, User, DefaultUser} from '../../database-utils';

AFRAME.registerComponent('ql-ds', {
  dependencies: ['data-array'],
  schema: {

    src: {
      type: 'string',
      default: 'user' // TODO keep in sync with rest ds maybe by using /region/assets as keys for data
    },
    query: {
      type: 'string',
      default: '' // 'regions {name data description dimensions owner { username   }   thumbnail {url name}   assets{    src{     name     url    }   }   }'
    }

  },
  init: function () {

  },
  update: function () {
    // TODO update query only if data has changed
    // perform local operations only when src element changes

    this.query();
  },
  query: function () {
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;

    let key = this.data.src;

    // TODO have one global instance of the current user
    new DB().setUser(DefaultUser).query(this.data.query)
      .then(function (entries) {
        // remove previous results
        observableDataArray.splice(0, observableDataArray.length);

        entries = _.get(entries, key);

        _.each(entries, (region, i) => {
          let mData = {key: i, value: region};
          // console.log('mData', mData);
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

});
