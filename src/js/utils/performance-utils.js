import * as _ from 'lodash';
import {FPSCtrl} from './fps-utils';
import {getRaycastPerfTree} from './raycaster-performance-util';

/**
 * Querys for components within the DOM that have specific attributes.
 *
 * @returns {Array.<*>}
 */

function getComponentsThatHavePerformanceInfo () {
  // find all components that have a performance info

  // returns all unique entities
  var entities = _.uniq(AFRAME.nk.querySelectorAll(document.querySelector('a-scene'), ':where(el)').map(m => m.el));

  var components = entities.map(cs => _.filter(cs.components, c => c.getPerformanceInfo)).filter(function (sub) {
    return sub.length;
  });

  return components;
}

/**
 * Returns an array of view-model and model objects one with relevant data to display one with more general information
 * @returns {{vm: Array, m: Array}}
 * @constructor
 */
export function ScriptImpactObject () {
  var components = getComponentsThatHavePerformanceInfo();

  var impacts = {vm: [], m: []};
  var count = 0;
  components = _.flatten(components);

  components.forEach(function (component) {
    var infos = component.getPerformanceInfo();
    for (var i = 0; i < infos.length; i++) {
      var j = i;

      var entry = {id: count, description: infos[i].description, impact: -1, unit: 'ms'};

      new FPSCtrl(0.3, function () {
        var singleInfo = component.getPerformanceInfo()[j];
        var current = _.round(singleInfo.impact, 4);
        entry.impact = current;
      }).start();

      impacts.vm.push(entry);
      impacts.m.push(infos[j].details);
      count++;
    }
  });

  return impacts;
}

export function RaycasterImpactObject (vueTable, callback) {
  var components = getComponentsThatHavePerformanceInfo();

  getRaycastPerfTree(function (treeArray) {
    var tableData = treeArray.map(function (entry) {
      var tRay = _.round(entry.data.time, 3);
      var tChildren = _.round(entry.data.cTime || 0, 3);
      return {
        vm:
                    {
                      el: _.get(entry.data.object, 'el.tagName', '-/-'),
                      time: _.round(tRay + tChildren, 3),
                      tRay,
                      tChildren,
                      id: entry.data.object.uuid

                    },
        m: entry
      };
    });

    // sort tree by cumulative time self raycast + children raycast
    tableData = _.orderBy(tableData, ['vm.time'], ['desc']);

    vueTable.clear();
    for (var entry of tableData) {
      vueTable.addRow(entry.vm);
    }

    callback(tableData);
  });
}

export function injectMethod (parent, methodName, doLog = true, onBefore, onAfter) {
  var stack = [];

  if (!onBefore) {
    onBefore = () => {
    };
  }
  if (!onAfter) {
    onAfter = () => {
    };
  }

  var fn = parent[methodName];
  return {
    start: function () {
      // listen to scene rendered

      // create timing
      parent[methodName] = function () {
        onBefore();
        var t0 = performance.now();
        let res = fn.apply(this, arguments);
        var t1 = performance.now();
        onAfter();

        if (doLog) {
          stack.push({timestamp: t0, time: t1 - t0, arguments: arguments});
        }
        return res;
      };
    },
    stop: function () {
      parent[methodName] = fn;
    },
    stats: function () {
      return stack;
    }

  };
}
