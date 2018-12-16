import dragDrop from 'drag-drop';
import {createHTML} from '../utils/dom-utils';
import {Logger} from '../utils/Logger';

var console = Logger.getLogger('fileupload');

var styleTpl = `
position: fixed;
    top: 0px;
    left: 0px;
    margin: 30vh 45vw 30vh 45vw;
    font-size: 70vh;
    text-shadow: 0px 0px 10vh #6a5acdf5;
    color: rgba(255,255,255,0.9);
    pointer-events:none;
`;

/**
 *
 * @typedef DropZoneCallback
 * @type {object}
 * @property file - A File descriptor.
 * @property {blob} blob - The file content object.

 *
 */

/**
 * TODO refactor into async/promise return file iterator
 * @param {HTMLElement} el - An element that will have the drop zone functionality.
 * @param {DropZoneCallback} onBlobCreated - A callback which returns a data object containing file info and a corresponding blob.
 */
export function createDropZone (el, onBlobCreated) {
  function onFileDrop (files, pos) {
    console.log('Here are the dropped files', files, pos);

    // `files` is an Array!
    files.forEach(function (file) {
      console.log(file.name);
      console.log(file.size);
      console.log(file.type);
      console.log(file.lastModifiedData);
      console.log(file.fullPath);

      // convert the file to a Buffer that we can use!
      var reader = new FileReader();
      reader.addEventListener('load', function (e) {
        // e.target.result is an ArrayBuffer
        var arr = new Uint8Array(e.target.result);
        var blob = new Blob([arr]);

        // do something with the blob!
        onBlobCreated({file, blob, pos});
      });
      reader.addEventListener('error', function (err) {
        console.error('FileReader error' + err);
      });
      reader.readAsArrayBuffer(file);
    });
  }

  function showHelper (e) {
    if (e.dataTransfer) {
      // TODO drop hint is not showing up.. something with font-awesome?
      if (!dropHelper) dropHelper = createHTML(`<i class="fa fa-cloud-upload fa-4x" style="${styleTpl}" aria-hidden="true">!</i>`);
      el.parentElement.append(dropHelper);
    }
  }

  var dropHelper;
  console.log('dropzone', el);
  dragDrop(el, {
    onDrop: onFileDrop,
    onDragEnter: function (e) {
      showHelper(e);
    },
    onDragOver: function (e) {
      console.log('is this visible when error occures?', arguments);
      showHelper(e);
    },
    onDragLeave: function (e) {
      if (e.dataTransfer) {
        dropHelper.parentElement.removeChild(dropHelper);
      }
    }
  });
}

/* FIXME does not work
document.addEventListener('DOMContentLoaded', function (event) {
  createDropZone(document.body);
}); */

// This will upload the file after having read it
export
const uploadFile = (file, url = window.location.origin + '/strapi/upload') => {
  console.log('file', file);

  var data = new FormData();
  data.append('file', file);
  data.append('user', 'hubot');

  return fetch(url, { // Your POST endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    body: data // This is your file object
  }).then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => console.log(success) // Handle the success response object
  ).catch(
    error => console.log(error) // Handle the error response object
  );
};
