import {streamIn} from './utils/stream-utils';
import {playSound} from './utils/aframe-utils';

import fetchQL from 'graphql-fetch';
import * as _ from 'lodash';
import {renderRegionFromDatabase} from './region-utils';

import Strapi from 'strapi-sdk-javascript/build/main';

// const baseURL = 'http://localhost:1337';
export const config = {
  url: '/strapi',
  login: '/auth/local',
  db: '/graphql'

};
const baseURL = config.url;

// FIXME 500 stream upload not working with redirect
export
// const strapiSDK = new Strapi(window.location.origin + config.url);
const strapiSDK = new Strapi('http://localhost:1337');

global['strapiSDK'] = strapiSDK;

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

async function TODOLOGIN () {
  let name = prompt('name');
  let pw = prompt('password');
  return strapiSDK.login(name, pw);
}

/*
TODO login gui
assets load
qraphql query for region assets */
export class User {
  constructor () {
    this.auth = false;
  }

  login (user, password) {
    return TODOLOGIN()
    /*
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
        */
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
