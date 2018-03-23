import {addScript} from '../utils/misc-utils';

import {create} from '../utils/dom-utils';
import {zip} from 'beta-dev-zip/lib/zip';
import * as _ from 'lodash';
window.zip = zip;
require('beta-dev-zip/lib/zip-ext'); // otherwise doesn't find zip

/**
 * In here all relevant code for importing,unzipping,converting, and prerendering models from sketchfab is located
 *
 * {@link https://sketchfab.com/d
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * evelopers/download-api/downloading-models/javascript}
 * {@link https://sketchfab.com/developers/download-api/libraries}
 *
 */

/**
 * Creates and returns a HTMLElement-Container that renders the asset browser of SketchFab.
 * @param onImport
 * @returns {*}
 */

export function loadBrowser (onImport) {
  var container = create(`<div class="skfb-widget"></div>`);

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

export
function importResult (result, onConverted) {
  var url = result.download.gltf.url;
  // result.download.gltf.size
  // result.download.gltf.expires

  // FIXME CORS when running locally  ....
  downloadZip(url, function (entries) {
    convertEntriesPromise(entries).then(function (fileUrls) {
      var options = {
        method: 'GET',
        headers: {
          Authorization: 'Bearer {INSERT_OAUTH_ACCESS_TOKEN_HERE}'
        },
        mode: 'cors'
      };

      // -------------------
      fetch(fileUrls['scene.gltf'].url, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (sceneFileContent) {
          var rewrittenLinksURL = rewritePathsOfSceneGLTF(sceneFileContent, fileUrls);
          onConverted(rewrittenLinksURL);
        });

      // -------------------
    });
  });
}

export
function convertEntriesPromise (entries) {
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

export
function downloadZip (url, entriesCallback) {
  zip.workerScriptsPath = '/lib/zip/';
  var reader = new HttpReader2(url); // zip.HttpReader
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
  var updatedBlob = new Blob([updatedSceneFileContent], { type: 'text/plain' });
  var updatedUrl = window.URL.createObjectURL(updatedBlob);
  // -> blob:http://example.com/a9b5c659-b032-4b7e-df19-5c42798fc049
  return updatedUrl;
}

// ------------------------------
// ------------------------------
// ------------------------------
/**
 * from beta-dev-zip/zip-ext to test circumvention of CORS
 * @param url
 * @constructor
 */
function HttpReader2 (url) {
  var that = this;

  function getData (callback, onerror) {
    var request;
    if (!that.data) {
      request = new XMLHttpRequest();
      request.addEventListener('load', function () {
        if (!that.size) { that.size = Number(request.getResponseHeader('Content-Length')); }
        that.data = new Uint8Array(request.response);
        callback();
      }, false);
      request.addEventListener('error', onerror, false);
      request.open('GET', url);
      request.responseType = 'arraybuffer';
      request.send();
    } else { callback(); }
  }

  function init (callback, onerror) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function () {
      that.size = Number(request.getResponseHeader('Content-Length'));
      callback();
    }, false);
    request.addEventListener('error', onerror, false);
    request.open('HEAD', url);
    request.send();
  }

  function readUint8Array (index, length, callback, onerror) {
    getData(function () {
      callback(new Uint8Array(that.data.subarray(index, index + length)));
    }, onerror);
  }

  that.size = 0;
  that.init = init;
  that.readUint8Array = readUint8Array;
}
HttpReader2.prototype = new zip.Reader();
HttpReader2.prototype.constructor = HttpReader2;
