import {getScene} from '../game-utils';
import * as _ from 'lodash';
import {convertRegionInfo} from '../a-components/datasource/region-ds';

/**
 * Note: don't use blob urls, only those with actual file name and extension
 * @param url
 * @param type
 * @returns {*}
 */
function addFileFromURL (url, type = 'image') {
  const name = url.split('/').pop();

  let obj = {
    url,
    format: type,
    name
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
  if (detail.format.indexOf('text') >= 0) {
    thumbnail = {url: 'assets/images/fa/file-text-o.png'};
  } else if (detail.format.indexOf('video') >= 0) {
    thumbnail = {url: 'assets/images/fa/file-video-o.png'};
  } else if (detail.format.indexOf('audio') >= 0) {
    thumbnail = {url: 'assets/images/fa/file-sound-o.png'};
  } else if (detail.format.indexOf('zip') >= 0) {
    thumbnail = {url: 'assets/images/fa/file-zip-o.png'};
  } else if (detail.format.indexOf('image') >= 0) {
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

const assetsQuery =
`
 assets{
    Type
    src{
      name
      
      
    }
    Name
    
  }
`;

AFRAME.registerComponent('assets-ds-x', {
  // dependencies: ['ql-ds'],
  schema: {

    src: {
      type: 'string',
      default: 'assets' //  "/region" //for rest-ds
    },
    query: {
      type: 'string',
      default: assetsQuery
    }
  },
  init: function () {
    this.el.setAttribute('ql-ds', this.data); // rest-ds

    // TODO make it easier to change underlying data
    // this.el.addEventListener('data-entry-change',

    this.el.addEventListener('data-change', (event) => {
      _.each(event.detail.items, (entry, i) => {
        event.detail.items[i] = {key: i, value: entry.value};

        global.resultAssets = event.detail.items;
      });
    });
  }
});
