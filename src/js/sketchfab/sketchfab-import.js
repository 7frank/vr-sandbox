import $ from 'jquery';
import {getPlayer} from '../game-utils';
import {getWorldPosition} from '../utils/aframe-utils';

/**
 * create an element that loads the data-url into a second instance on the same device
 * TODO make it work x-device
 * @deprecated
 */
export function importOrLoadFromCache (dataURL) {
  var tpl = `<a-entity class="imported-model"  networked="template:#imported-element-template;attachTemplateToLocal:true;">
        
        </a-entity>`;

  var el = $(tpl);

  var playerPos = getWorldPosition(getPlayer().object3D);

  el.get(0).setAttribute('position', AFRAME.utils.coordinates.stringify(playerPos));

  $('a-scene').append(el);

  el.get(0).setAttribute('networked-imported-model', 'src:' + dataURL);

  window.mLoadingbar.hide();

  return el.get(0);
}

/**
 *
 * @param url - sketchfab model link
 * @returns {*}
 */
export function createNetworkedGLTFEntity (url) {
  var tpl = `<a-entity class="imported-model"  networked="template:#imported-element-template;attachTemplateToLocal:true;">
        
        </a-entity>`;

  var el = $(tpl);

  el.get(0).setAttribute('networked-imported-model', 'src:' + url);

  return el.get(0);
}
