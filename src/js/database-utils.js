import {streamIn} from './utils/stream-utils';
import {getPlayer, getPositionInFrontOfEntity} from './game-utils';
import {createHTML} from './utils/dom-utils';
import {_setPosition} from './utils/aframe-utils';
import * as _ from 'lodash';

// const baseURL = 'http://localhost:1337';
const baseURL = '/strapi';

export async function connectToServer () {
  await streamIn(baseURL)
    .then(response => response.text());
}

export function queryAPI (route) {
  return streamIn(baseURL + route).then(response => response.json());
}

export function renderRegionFromDatabase (region, i = 0) {
  let content = region.data;
  let thumb = region.thumbnail;

  if (!thumb) thumb = {id: ''};

  if (!thumb.url) thumb.url = '#';
  else { thumb.url = baseURL + thumb.url; }

  let assetsTemplate = `<a-assets>
            <img id="${thumb.id}" src="${thumb.url}">
        </a-assets>
    `;
  getPlayer().sceneEl.appendChild(createHTML(assetsTemplate));

  let template = `
    <a-entity position="0 1 0" id="dbRegion1">
        <a-image position="0 1 0" src="${'#' + thumb.id}"></a-image>
        ${content}
    </a-entity>
    `;

  let regionInstance = createHTML(template);

  let position = getPositionInFrontOfEntity(getPlayer(), 5);

  position.z += i * 5;

  _setPosition(regionInstance, position);

  getPlayer().sceneEl.appendChild(regionInstance);
}

export function convertRegionInfoToThumbInfo (region, i = 0) {
  let content = region.data;
  let thumb = region.thumbnail;
  thumb = _.assignIn({}, thumb);

  if (!thumb) thumb = {id: ''};

  if (thumb.url) { thumb.url = baseURL + thumb.url; }

  console.log('thumb.url', thumb, thumb.url);
  return thumb;
}
