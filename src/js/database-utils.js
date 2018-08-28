import {streamIn} from './utils/stream-utils';
import {getPlayer, getPositionInFrontOfEntity} from './game-utils';
import {createHTML} from './utils/dom-utils';
import {_setPosition} from './utils/aframe-utils';

const baseURL = 'http://localhost:1337';

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

  let assetsTemplate = `<a-assets>
            <img id="${thumb.id}" src="${baseURL + thumb.url}">
        </a-assets>
    `;
  getPlayer().sceneEl.appendChild(createHTML(assetsTemplate));

  let template = `
    <a-entity position="0 1 0" id="dbRegion1">
        <a-image src="${'#' + thumb.id}"></a-image>
        ${content}
    </a-entity>
    `;

  let regionInstance = createHTML(template);

  let position = getPositionInFrontOfEntity(getPlayer(), 5);

  position.z += i * 5;

  _setPosition(regionInstance, position);

  getPlayer().sceneEl.appendChild(regionInstance);
}
