
import {renderImage, renderText, renderURL, toast} from './utils/aframe-utils';
import * as _ from 'lodash';
import {streamIn} from './utils/stream-utils';
import {isURL} from './utils/misc-utils';
import {addControlsToModel, appendImageToDOM} from './sketchfab/sketchfab-render';
import {isShiftDown} from './utils/file-drag-drop-utils';
import {retrieveImageOrTextFromClipboardAsBlob} from './utils/paste-utils';
import fileType from 'file-type';

export
function attachClipboard () {
  window.addEventListener('paste', onWindowPasteEvent);

  function onWindowPasteEvent (e) {
    // Handle the event
    retrieveImageOrTextFromClipboardAsBlob(e, function (data, type) {
      // If there's an image, display it in the canvas

      if (!data) return;

      if (type == 'image') {
        var imageBlob = data;
        var url = window.URL.createObjectURL(imageBlob);

        if (!isShiftDown()) {
          // relying on the default raycaster //TODO set cursor to rayorigin:mouse while dropping or find a better solution
          var intersects = document.querySelector('[cursor]').components['cursor'].intersectedEl;
          var id = appendImageToDOM(url).id;

          console.log('intersects', intersects);
          console.log('id', id);

          intersects.setAttribute('material', {src: '#' + id});
        } else {
          var el = renderImage(url);
          addControlsToModel(el);
        }
      } else if (type == 'text') {
        var str = data;

        if (isURL(str)) {
          toast('downloading: ' + str.substr(0, 10) + ' ..');

          var mFileType;

          streamIn(str, _.once(function onProgress (info) {
            if (!mFileType) {
              mFileType = fileType(info.value);
            }

            console.log('paste-download-progress detected filetype:', mFileType, info);
          })).then(async function (response) {
            // http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
            //  const url = 'http://assets-cdn.github.com/images/spinners/octocat-spinner-32.gif';
            // => {ext: 'gif', mime: 'image/gif'}
            var arrayBuffer = await response.arrayBuffer();

            if (!mFileType) {
              mFileType = fileType(arrayBuffer);
            }
            var blob = new Blob([arrayBuffer]);
            var objectURL = URL.createObjectURL(blob);

            // TODO
            if (!mFileType) {
              mFileType = {ext: '*', mime: 'text/*'};
              console.warn('no mime type detected, creating generic text', mFileType);
            }

            var el = renderURL(objectURL, mFileType);
            addControlsToModel(el);
          }).catch(function (e) {
            console.error(e);
            toast(e.message);
          });
        } else {
          var el = renderText(str);
          addControlsToModel(el);
        }
      }
    });
  }
}
