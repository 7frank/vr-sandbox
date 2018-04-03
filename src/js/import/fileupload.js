import dragDrop from 'drag-drop';
import {createHTML} from '../utils/dom-utils';

var styleTpl = `
position: fixed;
    top: 0px;
    left: 0px;
    margin: 30vh 45vw 30vh 45vw;
    font-size: 70vh;
    text-shadow: 0px 0px 10vh #6a5acdf5;
    color: rgba(255,255,255,0.9);
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
 *
 * @param {HTMLElement} el - An element that will have the drop zone functionality.
 * @param {DropZoneCallback} onBlobCreated - A callback which returns a data object containing file info and a corresponding blob.
 */
export
function createDropZone (el, onBlobCreated) {
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

  var dropHelper;
  console.log('dropzone', el);
  dragDrop(el, {
    onDrop: onFileDrop,
    onDragEnter: function () {
      // TODO drop hint is not showing up.. something with font-awesome?

      if (!dropHelper) dropHelper = createHTML(`<i class="fa fa-cloud-upload fa-4x" style="${styleTpl}" aria-hidden="true">!</i>`);
      el.parentElement.append(dropHelper);
    },
    onDragOver: function () {
      console.log(arguments);
    },
    onDragLeave: function () {
      el.parentElement.removeChild(dropHelper);
    }
  });
}

/* FIXME does not work
document.addEventListener('DOMContentLoaded', function (event) {
  createDropZone(document.body);
}); */
