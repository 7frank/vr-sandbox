import {streamIn} from './utils/stream-utils';
import {toast} from './utils/aframe-utils';

import fetchQL from 'graphql-fetch';
import * as _ from 'lodash';

import Strapi from 'strapi-sdk-javascript/build/main';
import {createLoginDialog} from './database/LoginDialog';

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

/**
 *
 * TODO improve loggin handling, log in once keep auth available in "Single Point of Truth"
 * assets load
 * qraphql query for region assets
 *
 */

export class User {
  constructor () {
    this.auth = false;
  }

  login (user, password) {
    // wait for current login process
    if (this.loginPromise) return this.loginPromise;

    // already logged in return auth
    if (this.auth) {
      toast('already logged in:' + this.auth.user.username);
      return Promise.resolve(this.auth);
    }

    const onCancel = () => {
      this.loginPromise = undefined;
    };

    this.loginPromise = createLoginDialog(onCancel);

    return this.loginPromise
      .then((auth) => {
        console.log('Well done!');
        console.log('User profile', auth.user);
        console.log('User token', auth.jwt);
        this.auth = auth;

        toast('Login Success');

        return auth;
      });
  }
}

/**
 * A simple graphql - based data source.
 *
 * TODO have some more options
 *
 *
 */
export const DefaultUser = new User();

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
