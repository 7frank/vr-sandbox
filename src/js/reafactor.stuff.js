
import {addScript} from './utils/misc-utils';
import {createHTML, setCenter} from './utils/dom-utils';
import {importResult, loadBrowser} from './sketchfab/sketchfab-browser';
import {renderGLTFOrGlbURL} from './utils/aframe-utils';
import $ from 'jquery';

document.addEventListener('DOMContentLoaded', function () {
  // TODO use or remove code-editor
  addScript('http://localhost:9000/api/node_modules/three-codeeditor/codeeditor3d.dev.js', function () {

  });
});

export
function loadSketchfabBrowser () {
  // -----------------------------
  // FIXME CORS when running locally  ....
  var dlg = createHTML("<nk-window title='Sketchfab Browser - Import' class='card card-1' style='height:400px;width: 800px;' >");
  var sf = loadBrowser(function onFileImportStart (result) {
    importResult(result, function (rewrittenLinksURL) {
      renderGLTFOrGlbURL(rewrittenLinksURL);
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
