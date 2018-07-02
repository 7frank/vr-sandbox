/**
 * TODO for now, only the closest region is used. but we might encounter problems when adding templates next to other regions this way.
 * @param selector
 * @param tplData
 */
import * as _ from 'lodash';
import $ from 'jquery';
export const addRegionInteractions_createEntity = (selector, tplData) => {
  var regions = $(selector);
  _.each(regions, function (region) {
    region.setAttribute('template-droppable', true);
    // we need to inject data directly because it is in html notation and can't be added via setAttribute
    region.setAttribute('template-droppable', 'template', tplData);
  });
};

export const removeRegionInteractions_createEntity = (selector) => {
  var regions = $(selector);
  _.each(regions, function (region) {
    if (region.hasAttribute('template-droppable')) {
      region.removeAttribute('template-droppable');
    }
  });
};

/**
 * FIXME performance and stuff
 * TODO this is probably redundant by using the raycaster or cursor cmoponent and filtering intersections  for regions
 * @deprecated
 * @returns {render}
 */
export function raycasterHelper (el, interval = 20) {
  var raycaster = new THREE.Raycaster();
  var intersects;

  return {
    cast: _.throttle(function render (camera, elements, recursive = false) {
      let mousePosition = el.sceneEl.systems.pointer.position;
      raycaster.setFromCamera(mousePosition, camera);
      intersects = raycaster.intersectObjects(elements, recursive);

      return intersects[0];
    }, interval)
  };
}
