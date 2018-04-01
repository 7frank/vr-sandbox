import {createHTML, setCenter} from '../utils/dom-utils';
import {convertEntriesPromise, downloadZip, loadBrowser, rewritePathsOfSceneGLTF} from './sketchfab-browser';
import $ from 'jquery';
import {getPlayer} from '../game-utils';
import {createNetworkedGLTFEntity} from './sketchfab-import';
import {scaleEntity} from '../utils/aframe-utils';

/**
 * Adds transformable controls (translate rotate scale) to the entity
 *
 * @param el
 */

export function addControlsToModel (el) {
  var sceneEl = el.sceneEl;

  el.setAttribute('transformable', true);

  sceneEl.setAttribute('transform-controls', {target: el});

  getPlayer().setAttribute('player-state', 'edit-model');

  notifyModelImported(el);
}

/**
 * Dispatch the event 'model-imported'
 * TODO use this per editable-region as an indicator when regions are loaded
 * @param el
 * @param target
 */

function notifyModelImported (el, target = document) {
  var event = new CustomEvent('model-imported', {detail: {modelEl: el}});

  // Dispatch the event.
  target.dispatchEvent(event);
}

/**
 * Creates an entity than loads the previously loaded model from memory
 *
 * @param dataURL
 * @returns {HTMLElement}
 */

export function createGLTFEntityFromDataURL (dataURL) {
  var tpl = `<a-entity class="imported-model"
        scale="1 1 1"
        animation-mixer="clip: *;"
        gltf-model="src: url(${dataURL});"> 
        </a-entity>`;

  return $(tpl).get(0);
}

/**
 * Renders a previously imported gltf-model at the position the player is standing.
 * @param rewrittenLinksURL
 * @returns {HTMLElement}
 */

export function renderGLTFOrGlbURL (rewrittenLinksURL) {
  var el = createGLTFEntityFromDataURL(rewrittenLinksURL);
  renderAtPlayer(el);

  window.mLoadingbar.hide();

  return el;
}

/**
 * TODO render imported elements within editable-region not scene
 *
 * @deprecated
 *
 *
 * @param el
 */

export function renderAtPlayer (el, target = $('a-scene')) {
  var playerPos = getPlayer().object3D.getWorldPosition();

  el.setAttribute('position', AFRAME.utils.coordinates.stringify(playerPos));

  target.append(el);
  // FIXME
  scaleEntity(el, 1);
}

/**
 * Download and render a zip file.
 *
 * @param {String} url - An url of a valid zip file. Should be be in memory already because it relies on secod param.
 * @param {} file - A file object containing additional information.
 */
export function renderZipFile (url, file = {}) {
  function onConverted (rewrittenLinksURL) {
    var modelEl = renderGLTFOrGlbURL(rewrittenLinksURL);
    addControlsToModel(modelEl);
  }

  function onProgress (info) {
    window.mLoadingbar.show();
    window.mLoadingbar.set('importing:' + file.name, info.current, info.size);
  }

  downloadZip(url, function (entries) {
    convertEntriesPromise(entries).then(function (fileUrls) {
      // -------------------
      fetch(fileUrls['scene.gltf'].url)
        .then(function (response) {
          return response.json();
        })
        .then(function (sceneFileContent) {
          var rewrittenLinksURL = rewritePathsOfSceneGLTF(sceneFileContent, fileUrls);
          onConverted(rewrittenLinksURL);
        });

      // -------------------
    });
  }, file.size, onProgress);
}

/**
 *
 */

export function loadSketchfabBrowser () {
  var dlg = createHTML("<nk-window title='Sketchfab Browser - Import' class='card card-1' style='height:400px;width: 800px;' >");
  var sf = loadBrowser(function onFileImportStart (result) {
    console.log('loadSketchfabBrowser result', result);
    //
    // TODO little bit redundant as this will query the server again
    var urlToZipFileInfo = result.model.uri + '/download';
    console.log('urlToZipFileInfo', urlToZipFileInfo);
    var el = createNetworkedGLTFEntity(urlToZipFileInfo);
    renderAtPlayer(el);

    /* importResult(result, function (rewrittenLinksURL) {
          var modelEl = renderGLTFOrGlbURL(rewrittenLinksURL);
          // var modelEl = importOrLoadFromCache(result.download.gltf.url);
          addControlsToModel(modelEl);
        }, function onProgress (info) {
          window.mLoadingbar.show();
          window.mLoadingbar.set('importing:' + result.model.name, info.current, info.size);
        });
          */
  });
  $(dlg).focus();

  $(sf).css('height', '100%');

  dlg.appendChild(sf);
  document.body.appendChild(dlg); // TODO have show method that if no parent is set sets to d.body

  setCenter(dlg);
}

/**
 * Creates an iframe.
 * @deprecated
 * @param url
 */

function prepareFrame (url) {
  var ifrm = document.createElement('iframe');
  ifrm.setAttribute('src', url);
  ifrm.style.width = '640px';
  ifrm.style.height = '480px';
  return ifrm;
}

/**
 * FIXME 'X-Frame-Options' same-origin set by sketchfab for oauth login prevent loading the login dialog inline
 *
 * @deprecated
 * @param url
 */
export function createSketchfabLoginFrame (url) {
  var dlg = createHTML("<nk-window title='Sketchfab Login ' class='card card-1' style='height:400px;width: 800px;' >");

  var ifrm = prepareFrame(url);

  $(ifrm).css('height', '100%');

  dlg.appendChild(ifrm);
  document.body.appendChild(dlg); // TODO have show method that if no parent is set sets to d.body

  setCenter(dlg);
}
