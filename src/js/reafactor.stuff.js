import {addScript} from './utils/misc-utils';
import {createHTML, setCenter} from './utils/dom-utils';
import {
  convertEntriesPromise, downloadZip, importResult, loadBrowser,
  rewritePathsOfSceneGLTF
} from './sketchfab/sketchfab-browser';
import {renderGLTFOrGlbURL} from './utils/aframe-utils';
import $ from 'jquery';
import {getPlayer} from './game-utils';
import {importOrLoadFromCache} from './index';

window.addEventListener('load', function () {
  // TODO use or remove code-editor
  addScript('http://localhost:9000/api/node_modules/three-codeeditor/codeeditor3d.dev.js', function () {

  });
});

export function addControlsToModel (el) {
  var sceneEl = el.sceneEl;

  el.setAttribute('transformable', true);

  sceneEl.setAttribute('transform-controls', {target: el});

  getPlayer().setAttribute('player-state', 'edit-model');

  notifyModelImported(el);
}

function notifyModelImported (el) {
  var event = new CustomEvent('model-imported', {detail: {modelEl: el}});

  // Dispatch the event.
  document.dispatchEvent(event);
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
alert('continue loadSketchfabBrowser');
export function loadSketchfabBrowser () {
  var dlg = createHTML("<nk-window title='Sketchfab Browser - Import' class='card card-1' style='height:400px;width: 800px;' >");
  var sf = loadBrowser(function onFileImportStart (result) {
    alert('continue');
    importOrLoadFromCache(result.download.gltf.url);

    importResult(result, function (rewrittenLinksURL) {
      var modelEl = renderGLTFOrGlbURL(rewrittenLinksURL);
      addControlsToModel(modelEl);
    }, function onProgress (info) {
      window.mLoadingbar.show();
      window.mLoadingbar.set('importing:' + result.model.name, info.current, info.size);
    });
  });
  $(dlg).focus();

  // TODO promisify functions
  /* downloadZip()
                    .then(convertEntriesPromise)
                    .then(fetchScene)
                    .then(rewritePathsOfSceneGLTF)
                    .then(renderGLTFOrGlbURL)
              */

  $(sf).css('height', '100%');

  dlg.appendChild(sf);
  document.body.appendChild(dlg); // TODO have show method that if no parent is set sets to d.body

  setCenter(dlg);
}
