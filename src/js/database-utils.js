import {streamIn} from './utils/stream-utils';
import {getAssets, getPlayer, getPositionInFrontOfEntity} from './game-utils';
import {createHTML} from './utils/dom-utils';
import {_setPosition} from './utils/aframe-utils';

import fetchQL from 'graphql-fetch';
import * as _ from 'lodash';

// const baseURL = 'http://localhost:1337';
export const config = {
  url: '/strapi',
  login: '/auth/local',
  db: '/graphql'

};
const baseURL = config.url;

/**
 *
 * @param url
 * @returns {*}
 */
export function changeRelativeURLFromConfig (url) {
  if (!url || isAbsolute(url)) return url;

  if (url && !_.startsWith(url, config.url)) {
    return config.url + url;
  }
  return url;
}

/**
 *
 * @type {RegExp}
 * @private
 */
const _absolute = new RegExp('^([a-z]+://|//)', 'i');

/**
 * check uif a url is absolute or relative
 * @param urlString
 * @returns {*|boolean}
 */
export function isAbsolute (urlString) {
  return _absolute.test(urlString);
}

/**
 * test if server connection could be established
 * @returns {Promise<void>}
 */
export async function connectToServer () {
  await streamIn(baseURL)
    .then(response => response.text());
}

/**
 * query REST-API
 * @param route
 * @returns {*}
 */
export function queryAPI (route) {
  return streamIn(baseURL + route).then(response => response.json());
}

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

export function renderRegionFromDatabase (region) {
  console.log('renderRegionFromDatabase', region);

  loadAssets(region.assets);

  let content = region.data;

  let template = `
    <a-entity  dotted-cube="dimensions:${region.dimensions}" class="db-region">  
        ${content}
    </a-entity>
    `;

  let regionInstance = createHTML(template);

  let position = getPositionInFrontOfEntity(getPlayer(), 5);

  position.y += Object.assign({x: 0, y: 0, z: 0}, AFRAME.utils.coordinates.parse(region.position)).y;

  _setPosition(regionInstance, position);

  getPlayer().sceneEl.appendChild(regionInstance);
}

// FIXME at least use events for global elements like this one
global.sandbox = {loadRegion: renderRegionFromDatabase};

/*
TODO login gui
assets load
qraphql query for region assets */
export class User {
  constructor () {
    this.auth = false;
  }

  login (user, password) {
    return fetch(config.url + config.login,
      {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: user,
          password: password
        })
      })
      .then(function (response) {
        return response.json();
      })
      .then((auth) => {
        //  console.log('Well done!');
        // console.log('User profile', auth.user);
        //  console.log('User token', auth.jwt);
        this.auth = auth;
      })
      .catch(function (error) {
        console.log('An error occurred:', error);
      });
  }
}

export class DB {
  setUser (user) {
    this.mUser = user;
    return this;
  }

  /**
     * @param  {Query} query graphql query without the query {} wrapper
     * @param  {Object} [vars]  graphql query args, optional
     * @param  {Object} [opts]  fetch options, optional
     */
  query (query, queryVars, opts) {
    let fetch = fetchQL(config.url + config.db);

    // TODO add default user auth bearer
    queryVars = _.assignIn({}, queryVars);

    return fetch(`query {  ${query}    }`, queryVars, opts).then(function (results) {
      if (results.errors) {
        console.error('Errors:', results.errors);
        throw new Error(results.errors);
      }
      return results.data;
    });
  }

  mutate () {
    throw new Error('missing implementation');
  }
}

// TODO test apollo/graphql use cases
// TODO use https://github.com/bennypowers/lit-apollo for starters
export let QLQueries = {
  region: function () {
    /*  return region(id:"234234wqwrwer") + QLQueries.regChunk

              */
    /*
                  {name
               data
               description
               dimensions
               position
               owner  { username   }
               thumbnail {url name}
               assets{
                 Type
                 Name
                 src{     name     url
                 }
               }   */
  },
  regions: `
 regions 
  {name
    data
    description 
    dimensions 
    position 
    owner  { username   }
    thumbnail {url name} 
    assets{ 
      Type
      Name
      src{     name     url  
      }  
    }  
  }  
 
  `
};
