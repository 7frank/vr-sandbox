import {createSketchfabLoginFrame} from './sketchfab-render';

function SketchfabOAuth2 (config) {
  if (!config) {
    throw new Error('SketchfabOAuth2 config is missing.');
  }

  if (!config.hasOwnProperty('hostname')) {
    config.hostname = 'sketchfab.com';
  }

  if (!config.hasOwnProperty('client_id')) {
    throw new Error('client_id is missing. Please check the config of SketchfabOAuth2.');
  }

  if (!config.hasOwnProperty('redirect_uri') && !config.hasOwnProperty('useDefaultURI')) {
    throw new Error('redirect_uri is missing. Please check the config of SketchfabOAuth2.');
  }

  this.config = config;
}

SketchfabOAuth2.prototype.connect = function (pendingCallback) {
  return new Promise(function (resolve, reject) {
    if (!this.config.client_id) {
      reject(new Error('client_id is missing.'));
      return;
    }

    // @TODO: allow users to pass their own state
    var state = +(new Date());
    var authorizeUrl = [
      'https://' + this.config.hostname + '/oauth2/authorize/?',
      'state=' + state,
      '&response_type=token',
      '&client_id=' + this.config.client_id,
      this.config.useDefaultURI ? '' : '&redirect_uri=' + encodeURIComponent(this.config.redirect_uri)
    ].join('');

    var loginPopup = window.lw = window.open(authorizeUrl, 'loginWindow', 'width=640,height=400');
    var state = null;

    // Polling new window
    var timer = setInterval(function () {
      // FIXME  in case popup was blocked
      // if (!loginPopup) { loginPopup = window.open(authorizeUrl, 'loginWindow', 'width=640,height=400'); }

      try {
        var url = loginPopup.location.href;

        // User closed popup
        if (url === undefined) {
          clearInterval(timer);
          reject(new Error('Access denied (User closed popup)'));
          return;
        }

        // not yet loaded. wait a little bit
        if (url == 'about:blank') {
          if (typeof pendingCallback === 'function') {
            pendingCallback({state: 'loading'});
          }
          return;
        }

        // User canceled or was denied access
        if (url.indexOf('?error=access_denied') !== -1) {
          clearInterval(timer);
          reject(new Error('Access denied (User canceled)'));
          loginPopup.close();
          return;
        }

        // Worked?
        if (url.indexOf(this.config.redirect_uri) !== -1 || this.config.useDefaultURI) {
          clearInterval(timer);

          var hash = loginPopup.location.hash;

          var grant;
          var accessTokenRe = RegExp('access_token=([^&]+)');

          if (hash.match(accessTokenRe)) {
            grant = parseQueryString(hash.substring(1));

            resolve({state: 'ok', grant});

            loginPopup.close();

            return;
          } else {
            reject(new Error('Access denied (missing token)'));

            loginPopup.close();

            return;
          }
        }
      } catch (e) {
        // the window has loaded the oauth page and we get cross origin exceptions thrown
        if (e.message.indexOf('cross-origin') > -1) {
          if (typeof pendingCallback === 'function') {
            pendingCallback({state: 'pending'});
          }
        } else {
          console.error('Login failed:', e);
        }
      }
    }.bind(this), 500);
  }.bind(this));
};

/**
 * parseQueryString
 * @param {string} queryString
 * @return {object} parsed key-values
 */
function parseQueryString (queryString) {
  var result = {};
  queryString.split('&').forEach(function (part) {
    var item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

module.exports = SketchfabOAuth2;
