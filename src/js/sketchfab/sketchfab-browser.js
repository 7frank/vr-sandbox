import {addScript} from '../utils/misc-utils';

import {createHTML} from '../utils/dom-utils';
import {zip} from 'beta-dev-zip/lib/zip';
import * as _ from 'lodash';
import {streamIn} from '../utils/stream-utils';
import {Logger} from '../utils/Logger';

/* eslint-disable */
import  SketchfabOAuth2 from './sketchfab.oauth2-1.1.0';
import {importOrLoadFromCache} from "../index";
import {addControlsToModel} from "../reafactor.stuff";
/* eslint-enable */

window.zip = zip; // leave here as zip need to be global
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

  addScript('https://apps.sketchfab.com/web-importer/sketchfab-importer.js', function () {
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

export function importResult (result, onConverted, onProgress) {
  var url = result.download.gltf.url;
  var fileSize = result.download.gltf.size;
  // result.download.gltf.expires
  console.log('importResult', result);
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
  }, fileSize, onProgress);
}

export function convertEntriesPromise (entries) {
  console.log('entries', entries);

  var promises = _.map(entries, function (entry) {
    return entry.uncompressedSize == 0 ? undefined : new Promise(function (resolve, reject) {
      /*
              entry.getData(new zip.BlobWriter('text/plain'), function onEnd (data) {
                var url = window.URL.createObjectURL(data);

                var res = {};
                res[entry.filename] = {url: url, size: entry.uncompressedSize};
                resolve(res);
              });
              */

      entry.getData(new zip.ArrayBufferWriter(), function onEnd (data) {
        data = new Blob([new Uint8Array(data)]);
        var url = window.URL.createObjectURL(data);

        var res = {};
        res[entry.filename] = {url: url, size: entry.uncompressedSize};
        resolve(res);
      });
    });
  });
  console.log('promises', promises);
  return Promise.all(promises).then(data => _.merge(...data));
}

export function downloadZip (url, entriesCallback, knownSize = -1, onProgress) {
  streamIn(url, onProgress, knownSize).then(response => response.blob())
    .then(function (blob) {
      console.log('blob', blob);
      console.log('arguments', arguments);
      zip.workerScriptsPath = '/lib/zip/';
      // zip.useWebWorkers = false;

      var reader = new zip.BlobReader(blob);
      zip.createReader(
        reader,
        function (zipReader) {
          zipReader.getEntries(function (entries) {
            entriesCallback(entries);
          });
        },
        function (error) {
          console.error(error);
        }
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
 *
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

/**
 * the login dialog asking for permissions
 * @param pendingCallback
 */
function openUserLogin (pendingCallback) {
  var config = {
    hostname: 'sketchfab.com',
    client_id: 'L3MirrReWDeKytcjKCTNX2pS4ci6hkSoNPWx8yaC',
    useDefaultURI: true
    // redirect_uri: '127.0.0.1:9000'
  };

  var client = new SketchfabOAuth2(config);

  return client.connect(pendingCallback)
    .then(function onSuccess (grant) {
      return grant;
    }).catch(function onError (error) {
      return error;
    });
}

var auth;

/**
 * Gets the authentication data for the current client.
 * If none is logged into sketchfab with this app, then a login dialog will ask for permissions.
 *
 * @returns {Promise}
 */
function getAuth () {
  return new Promise(function (resolve, reject) {
    if (auth) resolve(auth);
    else {
      openUserLogin(console.log).then(function (result) {
        auth = result.grant;
        resolve(auth);
      }).catch(reject);
    }
  });
}

/**
 * imports a model from sketchfab with initial login/auth
 *
 * @param url
 */

function importModel (url) {
  getAuth().then(function (grant) {
    console.log('grant', grant);

    var url = 'https://api.sketchfab.com/v3/models/429e0904ae0d40acb650d01b6b05a797/download';
    var options = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + grant.access_token
      },
      mode: 'cors'
    };

    fetch(url, options).then(function (response) {
      return response.json();
    }).then(function (data) {
      console.log('download file info', data);

      doLoadAndRenderNetworked(data, url);
    });
  });
}

window.importModel = importModel;

function doLoadAndRenderNetworked (data, url) {
  var result = {download: data, model: {name: url}};

  importResult(result, function (rewrittenLinksURL) {
    var modelEl = importOrLoadFromCache(rewrittenLinksURL);
    addControlsToModel(modelEl);
  }, function onProgress (info) {
    window.mLoadingbar.show();
    window.mLoadingbar.set('importing:' + result.model.name, info.current, info.size);
  });
}
