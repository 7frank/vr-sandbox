import {getScene} from '../game-utils';
import * as _ from 'lodash';

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

function validateFileOrURL (detail, prefixURL) {
  if (prefixURL) {
    detail.url = prefixURL + detail.url;
  }

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
AFRAME.registerComponent('assets-ds-temp', {
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

    // drag and drop listener
    getScene().addEventListener('file-dropped', ({detail}) => {
      let obj = validateFileOrURL(detail);

      // indicates that the file is not stored
      obj.isBlob = true;

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
      url
      size 
    }
    Name
  }
`;

/**
 * Creates a copy of an object like _.pick but with renaming the keys as well
 * Note :Extend by type check ..
 * TODO this should be done on dialog instead of datasource
 * @param obj
 * @param _interface
 */
export function transformObjectViaInterfaceMap (obj, _interface) {
  const result = {};
  _.each(_interface, (data, key) => {
    let [newKeyName, defaultValue] = data.split(':');
    const val = _.get(obj, key, defaultValue);
    _.set(result, newKeyName, val);
  });
  return result;
}

// TODO "oldKey" : "newkeyType: newKeyName = newKeyDefault"
let assetsDSInterface = {
  Name: 'name',
  'src.url': 'url',
  Type: 'format'
};

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
        // if the file is a blob we don't do anything as it was added via d&d
        if (entry.value.isBlob) return;

        let transformedData = transformObjectViaInterfaceMap(entry.value, assetsDSInterface);
        transformedData = validateFileOrURL(transformedData, window.location.origin + '/strapi');
        event.detail.items[i] = {key: i, value: transformedData};
        global.resultAssets = event.detail.items;
      });
    });

    // drag and drop listener
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;
    getScene().addEventListener('file-dropped', ({detail}) => {
      let obj = validateFileOrURL(detail);
      // indicates that the file is not stored
      obj.isBlob = true;
      observableDataArray.push({key: -1, value: obj});
    });
  }
});
