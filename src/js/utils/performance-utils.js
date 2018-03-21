import $ from 'jquery';
import * as _ from 'lodash';
import {FPSCtrl} from '../fps-util';

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
 * returns an array of view-model and model objects one with relevat data to display one with more general informations
 * @returns {{vm: Array, m: Array}}
 * @constructor
 */
export function ImpactObject () {
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
