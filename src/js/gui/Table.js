import {Enum} from 'enumify';
import Vue from 'vue/dist/vue.esm';
import {createHTML, setCenter} from '../utils/dom-utils';

import {ClientTable, Event} from 'vue-tables-2';

Vue.use(ClientTable, {});//, false, 'common', 'default'

/**
 *
 */
export function createTable (onRowClick = function () {}) {
  // datasource -------------------------------------

  // template -------------------------------------
  var el = createHTML(`<div id="people">
  <v-client-table :data="tableData" :columns="columns" :options="options"   @row-click="onRowClicked" ></v-client-table>
</div>`);

    // vue -------------------------------------
  var app = new Vue({
    el: el,
    data: {
      columns: [], // 'id', 'name', 'age'
      tableData: [
        /* { id: 1, name: 'John', age: '20' },
                { id: 2, name: 'Jane', age: '24' },
                { id: 3, name: 'Susan', age: '16' },
                { id: 4, name: 'Chris', age: '55' },
                { id: 5, name: 'Dan', age: '40' } */
      ],
      options: {
        // see the options API - https://github.com/matfish2/vue-tables-2#options
      }
    },
    methods: {
      onRowClicked: onRowClick
    }
  });

  app.addRow = function (entry) {
    var cols = this.$data.columns;
    var keys = Object.keys(entry);

    // add colums if not already there
    for (var key of keys) { if (cols.indexOf(key) < 0) cols.push(key); }

    this.$data.tableData.push(entry);
  };

  return app;
}
