import $ from 'jquery';
import {getFileExt} from './misc-utils';
import {
  addControlsToModel, appendImageToDOM, renderGLTFOrGlbURL,
  renderZipFile
} from '../sketchfab/sketchfab-render';
import {renderImage, renderVideo, toast} from './aframe-utils';
import {getCursor, getCursorComponent, getScene} from '../game-utils';

import {assetDialogIsVisible} from '../asset-menu/assets-ds.js';

// helper that keeps track of the shift key to dass functionality for dropping files
var bShift = false;
$(function () {
  $(document).on('keyup keydown', function (e) {
    bShift = e.shiftKey;
  });
});

export
function isShiftDown () {
  return bShift;
}

export function onDropZoneDrop (data) {
  var blob = data.blob;

  var format;

  if (data.file.type.indexOf('image') == 0) format = 'image';
  else if (data.file.type.indexOf('video') == 0) format = 'video';
  else {
    format = getFileExt(data.file);
  }

  var url = window.URL.createObjectURL(blob);

  // TODO create interface or similar

  data.file.url = url;
  data.file.format = format;

  // if asset dialog is not visible then have default behaviour and load images into dialog in the background
  // otherwise do not use default behaviour

  if (!assetDialogIsVisible) {
    loadFile(format, url, data.file);
  }

  getScene().emit('file-dropped', data.file);
}

/**
 * Loads the file from into the scene
 * @param format
 * @param url
 * @param file
 */

export
function loadFile (format, url, file) {
  switch (format) {
    case 'glb':
      var modelEl = renderGLTFOrGlbURL(url);
      addControlsToModel(modelEl);
      break;
    case 'zip':
      var el = renderZipFile(url, file);// TODO render zip

      break;
    case 'image':

      // Note: the image as texture option should be the default case, it can be assumed that materials are rather often applied directly to an element instead of stand alone plane.
      // TODO it seems we can't drag-hover images as the event does not contain the files
      if (!isShiftDown()) {
        // relying on the default raycaster //TODO set cursor to rayorigin:mouse while dropping or find a better solution
        var intersects = getCursorComponent().intersectedEl;
        var id = appendImageToDOM(url).id;

        console.log('intersects', intersects);
        if (intersects) { intersects.setAttribute('material', {src: '#' + id}); }
      } else {
        var el = renderImage(url);
        addControlsToModel(el);
      }
      break;
    case 'video':

      var el = renderVideo(url);
      addControlsToModel(el);

      break;

    default:
      // alert('unsupported file format. either use "*.glb" or a "*.zip" containing a file named "scene.gltf" as entry point or image or video assets');
      toast("unknown file format press 'ctrl+f'");
  }
}
