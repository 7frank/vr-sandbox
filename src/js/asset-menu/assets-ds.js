import template from './asset-menu.hbs';
import {getHUD, getScene} from '../game-utils';
import {MainMenuStack} from '../types/MenuStack';
import {createHTML} from '../utils/dom-utils';

export let MainOpenFileDialogInstance;

export function showAssetDialog () {
  if (!MainOpenFileDialogInstance) {
    MainOpenFileDialogInstance = new AssetDialog();
    MainOpenFileDialogInstance.toggle();
  } else {
    MainOpenFileDialogInstance.toggle();
  }
}

class AssetDialog {
  constructor () {
    let tpl = template();
    this.menu = createHTML(tpl);
    getHUD().append(this.menu);
  }

  isVisible () {
    return this.menu.getAttribute('visible');
  }

  toggle () {
    if (this.isVisible()) {
      MainMenuStack.pop();
    } else {
      MainMenuStack.push('asset-select-menu');
    }
  }
}

function addFileFromURL (url, type = 'image') {
  let obj = {
    url,
    type
  };
  let validated = validateFileOrURL(obj);
  console.log('validated', validated);
  return validated;
}

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

function validateFileOrURL (detail) {
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
    if (detail.url.indexOf('blob:') == 0) {
      const id = '#' + createImage(detail.url);
      thumbnail = {url: id};
    } else {
      thumbnail = {url: detail.url};
    }
  } else {
    thumbnail = {url: 'assets/images/fa/file-o.png'};
  }

  detail.thumbnail = thumbnail;
  return detail;
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

    [
      'https://i.imgur.com/mdPnuH6.jpg',
      'https://i.imgur.com/eHrOvDD.png',
      'https://i.imgur.com/D4YsQrL.jpg'
    ].forEach((url, k) => observableDataArray.push({key: -1, value: addFileFromURL(url, 'image')}));

    getScene().addEventListener('file-dropped', ({detail}) => {
      console.log('droppend in asset-ds', detail);

      let obj = validateFileOrURL(detail);
      observableDataArray.push({key: -1, value: obj});
    });
  }
});
