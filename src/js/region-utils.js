import * as _ from 'lodash';
import {getAssets, getPlayer, getPositionInFrontOfEntity, getWorld} from './game-utils';
import {createHTML} from './utils/dom-utils';
import {_setPosition, playSound} from './utils/aframe-utils';

function loadAssetItem (asset) {
  if (!asset.Name || !_.has(asset, 'src.url')) {
    console.error("can't load asset name or url missing", asset);
    return;
  }

  let types = {
    video: 'video',
    audio: 'audio',
    image: 'img',
    mesh: 'a-asset-item'
  };

  let mType = types[asset.Type];

  if (!mType) {
    console.error('unsupported asset Type', asset);
    return;
  }

  let el = AFRAME.nk.parseHTML(`<${mType} id=${asset.Name} src=${asset.src.url}></${mType}>`);

  getAssets().append(el);
}

/**
 * loads assets from database
 * TODO have a db-assets component that can be dropped in the vue template to load assets without rewriting paths at different places in code
 * TODO reenable error fallback mechanisms like error textures and load via fetch
 * @param asset
 */
function loadAssetImage (asset) {
  if (!asset.Name || !_.has(asset, 'src.url')) {
    console.error("can't load asset name or url missing");
  }

  let img = AFRAME.nk.parseHTML(`<img id=${asset.Name} src=${asset.src.url}  />  `);

  // document.body;
  getAssets().append(img);
  /*
              //FIXME
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

              */
}

function loadAssets (assets) {
  /*
         assets.filter(asset => asset.Type == 'image').forEach(loadAssetImage);

         assets.filter(asset => asset.Type != 'image').forEach(loadAssetItem);
       */
  assets.forEach(loadAssetItem);
}

function unloadRegion () {
  getWorld().innerHTML = '';
}

/**
 * loads the static region definitions
 */
export function loadStaticRegionDemo () {
  let regions = require('../scene/demoRegions.hbs');

  getWorld().innerHTML = regions({
    defaults: {
      camera: {
        position: '0 0 3.8'
      },
      sky: {
        color: '#ECECEC'
      }
    }
  });

  /**
     * TODO test interaction between hudhud and material-components
     * potentially use ui-renderer to emulate hud instead of current approach
     * https://github.com/shaneharris/shanes-editor
     * https://github.com/shaneharris/aframe-material-collection/tree/master/src
     */

  document.querySelector('a-scene').append(AFRAME.nk.parseHTML('<a-entity material-component-example></a-entity>'));
}

/**
 * FIXME can't unload region otherwise the a-button => sound component will fuck things up
 * @param region
 * @param unloadPrevious
 */

export function renderRegionFromDatabase (region, unloadPrevious = false) {
  console.log('renderRegionFromDatabase', region);

  if (unloadPrevious) {
    unloadRegion();
  }
  // unload test
  getWorld().querySelectorAll('[dotted-cube]').toArray().forEach(el => el.parentElement.removeChild(el));

  loadAssets(region.assets);

  let content = region.data;
  // todo editable region
  // <a-box position="0 0 100" editable-region="src:assets/demo/region/rocket-league.html"></a-box>

  let template = `
    <a-entity  dotted-cube="dimensions:${region.dimensions}" class="db-region">  
        ${content}
    </a-entity>
    `;

  let regionInstance = createHTML(template);

  let position = getPositionInFrontOfEntity(getPlayer(), 5);

  position.y += Object.assign({x: 0, y: 0, z: 0}, AFRAME.utils.coordinates.parse(region.position)).y;

  _setPosition(regionInstance, position);

  getWorld().appendChild(regionInstance);
}

// FIXME at least use events for global elements like this one
global.sandbox = {loadRegion: renderRegionFromDatabase, playSound};
