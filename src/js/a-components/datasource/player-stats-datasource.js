import * as _ from 'lodash';

AFRAME.registerComponent('player-stats-datasource', {
  dependencies: ['data-array'],
  schema: {},
  init: function () {
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;

    document.body.addEventListener('connected', (evt) => {
      let clientId = evt.detail.clientId;
      let mData = {key: -1, value: 'Me', clientId, score: 0};

      observableDataArray.push(mData);
    });

    document.body.addEventListener('clientConnected', function (evt) {
      let clientId = evt.detail.clientId;
      let mData = {key: -1, value: clientId, clientId, score: 0};

      observableDataArray.push(mData);
    });
    document.body.addEventListener('clientDisconnected', function (evt) {
      let clientId = evt.detail.clientId;

      let res = _.filter(observableDataArray, _.matches({value: clientId}));

      res.forEach(o => {
        let pos = observableDataArray.indexOf(o);
        if (pos >= 0) { observableDataArray.splice(pos, 1); }
      });
    });
  }
});
