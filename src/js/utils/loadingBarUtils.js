import $ from 'jquery';
import {template} from './misc-utils';

import MutationSummary from 'mutation-summary';

/**
 * sample loading bar
 * @param html
 * @returns {{set: (function(*, *, *): *), show: (function(): *)}}
 */
export function createLoadingbar (html) {
  if (!html) {
    html = '<span>{curr}/{max}  {name}</span>';
  }

  var mustache = template(html);

  var container = $('<div style="border:2px solid white" class="loading-bar"></div>')
    .css({position: 'fixed', width: 'calc(100% - 2em)', margin: '1em', zIndex: 999, top: '0em'});
    //  .appendTo('body');

  return {
    set: (name, curr, max) => container.html(mustache({name, curr, max})),
    show: () => container.appendTo('body'),
    hide: () => container.remove()

  };
}

export function addLoadingListenersToScene (scene, loadedhandler = () => {
}) {
  var assets = scene.querySelector('a-assets');

  var loadingBar = createLoadingbar(`<div style="z-Index:20000;background-color:slateblue;width:calc({curr}/{max} * 100%)">{name}</div>`);

  // TODO we should use the asset manager to have only oe loading response or alterntivly emit import-progress events and others
  window.mLoadingbar = loadingBar;
  if (assets == null) {
    console.log('scene does not contain assets for the loader');
    loadedhandler();
    return;
  }

  var manager = assets.fileLoader.manager;
  manager.onStart = function (...args) {
    loadingBar.show();
    // console.log('scene assests start loading', args);
  };

  manager.onError = function (...args) {
    console.log('scene assests error loading', args);
  };
  manager.onProgress = function (element, current, max) {
    loadingBar.set(element, current, max);
    // console.log('scene assests progress loading', arguments);
  };

  manager.onLoad = function () {
    //  console.log('scene assets loaded', arguments);
    loadingBar.hide();

    loadedhandler();
  };
}

/**
 * have a listener that checks for gltf-model attributes
 * to be able to attach model-error listener to it and give
 * a per entity feedback for when it failed
 *
 * @type {MutationSummary}
 */

var observer = new MutationSummary({
  callback: handleChanges,
  queries: [{attribute: 'gltf-model'}]
});

function handleChanges (summaries) {
  var hTweetSummary = summaries[0];

  hTweetSummary.added.forEach(function (newEl) {
    console.log('observing gltf stuff', newEl);

    function removeErrorInfo () {
      // TODO clear or remove entity.console
    }

    function addErrorInfo (e) {
      var el = e.target;
      window['jQuery'] = $;
      var scaleStr = $(el).attr('scale');
      var scale = AFRAME.utils.coordinates.parse(scaleStr);
      var inverseScale = new THREE.Vector3(1 / scale.x, 1 / scale.y, 1 / scale.z);

      var errorContainer = $('<a-entity>').attr('scale', AFRAME.utils.coordinates.stringify(inverseScale));

      $(errorContainer).append(`
     <a-sphere  position="0 2 0" radius="0.1" color="#FFC65D"></a-sphere>
     <a-cylinder position="0 1.3 0"  radius="0.1" height="0.7" color="#FFC65D"></a-cylinder>
      `);

      $(el).append(errorContainer);

      var textEl = $(`<a-text look-at="src:[camera]" color="#f00" width=10 align="center" position="0 0.5 0" value="Error: Loader:${e.detail.format} - ${e.detail.src}"></a-text>`);
      $(errorContainer).append(textEl);
    }

    newEl.addEventListener('model-loaded', removeErrorInfo);
    newEl.addEventListener('model-error', addErrorInfo);

    // do setup work on new elements with data-h-tweet
  });

  /* hTweetSummary.valueChanged.forEach(function(changeEl) {
          var oldValue = hTweetChanges.getOldAttribute(changeEl);
          var currentValue = changeEl.getAttribute(‘data-h-tweet’);
          // handle value changed.
      });

      hTweetSummary.removed.forEach(function(removedEl) {
          // do tear-down or cleanup work for elements that had
          // data-h-tweet.
      }); */
}
