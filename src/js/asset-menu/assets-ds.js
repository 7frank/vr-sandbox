import template from './asset-menu.hbs';
import {getHUD, getScene} from '../game-utils';
import {MainMenuStack} from '../types/MenuStack';
import {createHTML} from '../utils/dom-utils';
import {loadFile} from '../utils/file-drag-drop-utils';
import {toast} from '../utils/aframe-utils';

// FIXME add hide dialog behaviour as this is currently ignored
export
let assetDialogIsVisible = false;
let dialogInstance;
export function showAssetDialog () {
  if (!dialogInstance) {
    let tpl = template();
    let menu = createHTML(tpl);
    getHUD().append(menu);
    MainMenuStack.push('asset-select-menu');
    dialogInstance = menu;

    assetDialogIsVisible = true;
  }

  // TODO toggle dialog
}

/*
 create dialog from template
 show hide
    ...
  ds from dropped files
  and others

  improve look and feel of dialog

*/
let counter = 0;
AFRAME.registerComponent('assets-ds', {
  dependencies: ['data-array'],
  schema: {},
  init: function () {
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;

    /**
       * data urls are for whatever reason not working
       * to circumvent that we create our own images for now
       * @param dataurl
       * @returns {string}
       */

    function createImage (dataurl) {
      const uuid = 'asset-dialog-image-' + counter++;

      const img = AFRAME.nk.parseHTML(`<img id=${uuid} style='display:none' src='${dataurl}' />`);
      document.body.append(img);

      return uuid;
    }

    getScene().addEventListener('file-dropped', ({detail}) => {
      console.log('droppend in asset-ds', detail);

      let thumbnail;
      if (detail.type.indexOf('text') >= 0) {
        thumbnail = {url: 'assets/images/fa/file-text-o.png'};
      } else if (detail.type.indexOf('video') >= 0) {
        thumbnail = {url: 'assets/images/fa/file-video-o.png'};
      } else if (detail.type.indexOf('audio') >= 0) {
        thumbnail = {url: 'assets/images/fa/file-sound-o.png'};
      } else if (detail.type.indexOf('zip') >= 0) {
        thumbnail = {url: 'assets/images/fa/file-zip-o.png'};
      } else if (detail.type.indexOf('image') >= 0) {
        const id = '#' + createImage(detail.url);

        thumbnail = {url: id};
      } else {
        thumbnail = {url: 'assets/images/fa/file-o.png'};
      }

      detail.thumbnail = thumbnail;

      observableDataArray.push({key: -1, value: detail});
    });
  }
});
