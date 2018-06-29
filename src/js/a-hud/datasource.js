import ObservableArray from 'observable-array';
import * as _ from 'lodash';

/**
 * TODO this should be a simple observable array that emmits some crud events on changes
 */

AFRAME.registerComponent('data-array', {
  schema: {items: {default: ObservableArray()},
    maxItemCount: {type: 'number', default: 0} // can be set when loading data arrays to hint how many values there are to come
  },
  init: function () {
    // TODO for aggregation of events it might be good to have detail:{data,added,removed}
    // or a stack containing all changes to the array from the last time change was called via throttle
    this.data.items.on('change', (event) => {
      // map observable array! in case the array gets altered which would break like in case hen we use vue for the gui-list-view
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

AFRAME.registerComponent('sample-preview-datasource', {
  dependencies: ['data-array'],
  schema: {},
  init: function () {
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;

    // ------------------------
    var data = [

      {
        key: 2,
        value: 'frame',
        scaling: 0.8,
        selector: '#bikeModel',
        part: ":where(name='Cadru1')",
        position: '0 -0.3 0'
      },
      {
        key: 3,
        value: 'seat',
        scaling: 0.8,
        selector: '#bikeModel',
        part: ":where(name='Sa')",
        position: '-.1 -.4 0'
      },
      {
        key: 4,
        value: 'waterbottle',
        scaling: 0.8,
        selector: '#bikeModel',
        part: ":where(name='BidonRosu')",
        position: '-.05 -.3 0'
      },
      {
        key: 5,
        value: 'handlebars',
        scaling: 0.8,
        selector: '#bikeModel',
        part: ":where(name='Ghidon')",
        position: '0.17 -0.35 0'
      },
      {key: 6, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SabotFataS')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Ghidon2')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior09')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior13')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior50')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior45')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='MecPedDr')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior4')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior05')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SurubJos')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior01')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='BidonGalben')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior19')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SurubSus')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior41')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SabotSpate')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior41')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior12')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Sa')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior43')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Cadru1')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior22')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CapacBRosu')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CabluPinioane')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior17')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior34')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='FranaFata')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior13')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior49')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior46')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior2')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior30')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Cadru2')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior26')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='DerailleurSpate')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ManetaVitezeSt')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior28')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior17')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior2')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior44')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CorpManetaDr')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior06')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior36')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior38')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CorpManetaSt')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Ventil01')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior04')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior1')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior27')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior15')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SabotFataS')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior37')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Sa1')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='PneuInteriorSpate')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='RolaLant1')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior01')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior36')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior1')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior42')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior02')"},
      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior31')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior12')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='RolaLant2')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior16')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='PneuExteriorSpate')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior47')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='PedalaD')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ManetaDr')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior18')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='FranaSpate')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior35')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior26')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior45')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CabluPlatouri')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='AxPedalier')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior0')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior46')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior23')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior27')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='PneuInteriorFata')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior14')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ProtectieManSt')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior2')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior31')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='BidonRosu')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior32')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior15')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior03')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='RoataFata')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ClapaRoata01')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='DerrailleurPlatour')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior03')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Ventil')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior47')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior10')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior29')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior49')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior38')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ProtectieManDr')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Pedal')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior34')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='AxGhidon')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior48')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior24')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior32')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior39')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior07')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior48')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Ghidon')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior2')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior22')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior04')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CabluPlatouriF')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior25')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ManetaVitezeDr')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior37')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior20')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior18')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ClapaRoata')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CapacBGalbe')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CabluFranaSpateS')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior23')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SuportBidonOrizontal')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='PedalaSt')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior30')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Furca')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior06')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior40')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='CabluPinioan')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SuportBidonVertical')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='Pinioane')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SabotFataD')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior11')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior09')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior35')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='RoataSpate')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior21')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior39')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ManetaS')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='PneuExteriorFata')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior08')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior33')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='MecPedSt')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='SabotSpateS')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior42')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior05')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior07')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior08')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior1')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior44')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior50')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior20')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior43')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior16')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior14')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaExterior25')"},

      {key: 1, value: '...', scaling: 0.8, selector: '#bikeModel', part: ":where(name='ZaInterior33')"}

    ];

    console.log('sample-preview-datasource pushing data every 30ms');
    var i = 0;

    dataArrayData.maxItemCount = data.length;

    setInterval(() => {
      let count = _.random(1, 4);
      let mData = data.slice(i, i + count);

      if (mData.length > 0) {
        observableDataArray.push(...mData);
      } else {
        console.log('sample-preview-datasource done pushing data');
      }
      i += count;
    }, 1000);
  }
});
