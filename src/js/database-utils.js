import {streamIn} from './utils/stream-utils';
import {getPlayer, getPositionInFrontOfEntity} from './game-utils';
import {createHTML} from './utils/dom-utils';
import {_setPosition, toast} from './utils/aframe-utils';

import {ErrorTexture} from '@nk11/animation-lib/src/js/fbo/ErrorTexture';

// const baseURL = 'http://localhost:1337';
export const config = {url: '/strapi'};
const baseURL = config.url;

export async function connectToServer () {
  await streamIn(baseURL)
    .then(response => response.text());
}

export function queryAPI (route) {
  return streamIn(baseURL + route).then(response => response.json());
}

function loadAssetImage (asset) {
  let img = AFRAME.nk.parseHTML(`<img id=${asset.Name}  />  `);
  document.body.append(img);

  fetch(asset.src)
    .then(function (response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response;
    })
    .then(response => response.blob())
    .then(images => {
      // Then create a local URL for that image and print it
      let dataURL = URL.createObjectURL(images);
      img.src = dataURL;
    }).catch(e => {
      let errorTexture = new ErrorTexture().setErrorMessage(asset.Name + ' not found', 512, 512);
      let dataURL = errorTexture.getDataURL();

      // img.src = dataURL;
      img.src = '/assets/images/Octocat.png';
      toast('Asset:' + asset.Name + ' not loaded');
    });
}

function loadAssets (assets) {
  assets.filter(asset => asset.Type == 'image').forEach(loadAssetImage);
}

export function renderRegionFromDatabase (region) {
  console.log('renderRegionFromDatabase', region);

  loadAssets(region.assets);

  let content = region.data2; // TODO

  let template = `
    <a-entity position="0 1 0" class="db-region">  
        ${content}
    </a-entity>
    `;

  let regionInstance = createHTML(template);

  let position = getPositionInFrontOfEntity(getPlayer(), 5);

  // position.z += i * 5;

  _setPosition(regionInstance, position);

  getPlayer().sceneEl.appendChild(regionInstance);
}

// FIXME at least use events for global elements like this one
global.sandbox = {loadRegion: renderRegionFromDatabase};
