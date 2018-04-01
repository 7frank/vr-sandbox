import {addScript} from '../utils/misc-utils';

import {createHTML} from '../utils/dom-utils';
import {zip} from 'beta-dev-zip/lib/zip';
import * as _ from 'lodash';
import {streamIn} from '../utils/stream-utils';
import {Logger} from '../utils/Logger';

import store from 'store';

window.store = store;
/* eslint-disable */
import SketchfabOAuth2 from './sketchfab.oauth2-1.1.0';
import {importOrLoadFromCache} from "./sketchfab-import";
import {addControlsToModel} from "./sketchfab-render";
import {createGLTFEntityFromDataURL} from "./sketchfab-render";
/* eslint-enable */

window.zip = zip; // leave here as zip needs to be global for zip-ext
require('beta-dev-zip/lib/zip-ext'); // otherwise doesn't find zip

var console = Logger.getLogger('sketchfab-browser');

/**
 * In here all relevant code for importing,unzipping,converting, and pre-rendering models from sketchfab is located
 *
 * {@link https://sketchfab.com/developers/download-api/downloading-models/javascript}
 * {@link https://sketchfab.com/developers/download-api/libraries}
 *
 */

/**
 * Creates and returns a HTMLElement-Container that renders the asset browser of SketchFab.
 * @param onImport
 * @returns {*}
 */

export function loadBrowser (onImport) {
  var container = createHTML(`<div class="skfb-widget"></div>`);

  document.body.append(container);

  addScript('https://apps.sketchfab.com/web-importer/sketchfab-importer.js').then(function () {
    var el = container;// document.querySelector('.skfb-widget');
    var skfbWidget = new SketchfabImporter(el, { // eslint-disable-line no-undef
      onModelSelected: function (result) {
        // Do something with the result
        onImport(result);
      }
    });
  });

  return container;
}

/**
 *  Imports the result of the download-query - for a certain url - to the sketchfab data api.
 *  {download: data, model: {name: url}}
 *
 * @param {object} result -The result from the previous query.
 * @param {object} result.download - A data object.
 * @param {object} result.download.gltf - A descriptor for the zip-file - containing a "scene.gltf" file and other assets - for the actual download.
 * @param {string} result.download.gltf.url - The target URL.
 * @param {number} result.download.gltf.size - The size in byte.
 * @param {number} result.download.gltf.expires - The time in seconds the download link is valid.
 * @param {object} result.model
 * @param {string} result.model.name - The persistent unique link to identify or restart the download.
 * @param {callback} onProgress - Can be used to listen to the download progress.
 * @returns {Promise.<URL>} - returns an URL of the scene-gltf file as memory object
 */
export
async function importResult (result, onProgress) {
  var url = result.download.gltf.url;
  var fileSize = result.download.gltf.size;
  // result.download.gltf.expires
  console.log('importResult', result);

  var entries = await downloadZip(url, fileSize, onProgress);
  var fileUrls = await convertEntriesPromise(entries);
  // -------------------
  var response = await fetch(fileUrls['scene.gltf'].url);
  var sceneFileContent = await response.json();

  var rewrittenLinksURL = rewritePathsOfSceneGLTF(sceneFileContent, fileUrls);
  return rewrittenLinksURL;
}

/**
 * Takes the result of  the zip reader and converts the file entries into memory URLs.
 *
 * @param entries - The result object.
 * @returns {Promise.<TResult>}
 */
export function convertEntriesPromise (entries) {
  console.log('entries', entries);

  var promises = _.map(entries, function (entry) {
    return entry.uncompressedSize == 0 ? undefined : new Promise(function (resolve, reject) {
      entry.getData(new zip.ArrayBufferWriter(), function onEnd (data) {
        data = new Blob([new Uint8Array(data)]);
        var url = window.URL.createObjectURL(data);

        var res = {};
        res[entry.filename] = {url: url, size: entry.uncompressedSize};
        resolve(res);
      });
    });
  });
  return Promise.all(promises).then(data => _.merge(...data));
}

/**
 *
 * Downloads the actual zip file that contains the gltf scene
 *
 * @param url
 * @param knownSize
 * @param onProgress
 * @returns {Promise}
 */

export
async function downloadZip (url, knownSize = -1, onProgress) {
  var response = await streamIn(url, onProgress, knownSize);
  var blob = await response.blob();

  zip.workerScriptsPath = '/lib/zip/';

  return new Promise(function (resolve, reject) {
    var reader = new zip.BlobReader(blob);
    zip.createReader(
      reader,
      function (zipReader) {
        zipReader.getEntries(function (entries) {
          resolve(entries);
        });
      }, reject
    );
  });
}

/**
 *
 * @typedef ZipFileInfo
 * @type {object}
 * @property {string} url - the data url.
 * @property {number} size - The original filesize in byte.
 *
 */

/**
 * Remaps urls found in json of schene.gltf to dataURLS
 * @param {object} sceneFileContent - The parsed JSON object file.
 * @param {Map<string,ZipFileInfo>} fileUrls - A map containing original filenames as key
 */
export function rewritePathsOfSceneGLTF (sceneFileContent, fileUrls) {
  // sceneFileContent is the content of scene.gltf
  // and fileUrls is a key/value object,
  // keys being filenames and values being corresponding URLs

  if (!fileUrls) throw new Error('needs a dictionary as second param to rewrite urls');

  var json = sceneFileContent;

  // Replace original buffers and images by blob URLs
  if (json.hasOwnProperty('buffers')) {
    for (var i = 0; i < json.buffers.length; i++) {
      console.log('buffers before after', json.buffers[i].uri, fileUrls[json.buffers[i].uri]);
      json.buffers[i].uri = fileUrls[json.buffers[i].uri].url;
    }
  }

  if (json.hasOwnProperty('images')) {
    for (var i = 0; i < json.images.length; i++) {
      console.log('images before after', json.images[i].uri, fileUrls[json.images[i].uri]);
      json.images[i].uri = fileUrls[json.images[i].uri].url;
    }
  }

  var updatedSceneFileContent = JSON.stringify(json, null, 2);
  var updatedBlob = new Blob([updatedSceneFileContent], {type: 'text/plain'});
  var updatedUrl = window.URL.createObjectURL(updatedBlob);
  // -> blob:http://example.com/a9b5c659-b032-4b7e-df19-5c42798fc049
  return updatedUrl;
}

// ------------------------------
// ------------------------------
// ------------------------------
// ------------------------------

/**
 *
 * @typedef SketchfabUserAuth
 * @type {object}
 * @property {string} access_token - Contains the token to authenticate the user for requests.
 * @property {string} expires_in - The Time in seconds the auth will be invalidated.
 * @property {string} scope - The level of priviliges e.g. "read+write"
 * @property {string} state - The login time in milliseconds
 * @property {string} token_type -  Default is 'Bearer'.

 * @param pendingCallback
 * @returns {SketchfabUserAuth}
 */
export
async function openUserLogin (pendingCallback) {
  console.log('openUserLogin');
  var config = {
    hostname: 'sketchfab.com',
    client_id: 'L3MirrReWDeKytcjKCTNX2pS4ci6hkSoNPWx8yaC',
    useDefaultURI: true
    // redirect_uri: '127.0.0.1:9000'
  };

  var client = new SketchfabOAuth2(config);
  var auth = await client.connect(pendingCallback);
  return auth;
}

// ---------------------------------------
// ---------------------------------------
// ---------------------------------------

var auth = store.get('user.auth');// the result of the auth
var pendingAuth = null;// a promise for th user authentication

function hasAuthExpired (auth) {
  return parseInt(auth.state) + parseInt(auth.expires_in * 1000) - new Date().getTime() < 0;
}

/**
 * Gets the authentication data for the current client.
 * If none is logged into sketchfab with this app, then a login dialog will ask for permissions.
 * @returns {Promise}
 */

export
async function getAuth () {
  if (auth && !hasAuthExpired(auth)) return auth;
  else {
    // have only one login dialog even for multiple auth requests
    if (!pendingAuth) {
      pendingAuth = openUserLogin(console.log);
    }

    var result = await pendingAuth.catch((e) => {
      pendingAuth = null;
      throw e;
    });
    auth = result.grant;
    store.set('user.auth', auth);

    pendingAuth = null;
    return auth;
  }
}

/**
 * imports a model from sketchfab with initial login/auth
 *  TODO  we need 2 ways to import
 * (1) locally for the user that does start the import
 * (2)there should be a widget that shows models that need to be syncronised if the user clicks the sync button or if
 *
 * @param url
 */

export
async function importModel (url) {
  console.log('url', url);
  var grant = await getAuth();
  console.log('grant', grant);

  // var url = 'https://api.sketchfab.com/v3/models/429e0904ae0d40acb650d01b6b05a797/download';
  var options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + grant.access_token
    },
    mode: 'cors'
  };

  var response = await fetch(url, options);
  var data = await response.json();

  console.log('fetch result', data);

  var dataURL = await doLoadFileToDataUrl(data, url);
  // var modelEl = importOrLoadFromCache(dataURL);
  var modelEl = createGLTFEntityFromDataURL(dataURL);
  // addControlsToModel(modelEl);
  return modelEl;
}

/**
 *
 * @param data
 * @param url - is only there for the  moment hopefully to match the result what the sketchfab browser returns
 * @returns {Promise}
 */

export
async function doLoadFileToDataUrl (data, url) {
  var result = {download: data, model: {name: url}};

  var rewrittenLinksURL = await importResult(result, function onProgress (info) {
    window.mLoadingbar.show();
    window.mLoadingbar.set('importing:' + result.model.name, info.current, info.size);
  });

  return rewrittenLinksURL;
}
