import $ from 'jquery';
import {template} from './util';

/**
 * sample loading bar
 * @param html
 * @returns {{set: (function(*, *, *): *), show: (function(): *)}}
 */
export
function createLoadingbar (html) {
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

export
function addLoadingListenersToScene (scene, loadedhandler = () => {
}) {
  var assets = scene.querySelector('a-assets');

  var loadingBar = createLoadingbar(`<div style="background-color:slateblue;width:calc({curr}/{max} * 100%)">{name}</div>`);

  console.log(assets);
  if (assets == null) {
    console.log('scene does not contain asssets for the loader');
    loadedhandler();
    return;
  }

  var manager = assets.fileLoader.manager;
  manager.onStart = function () {
    loadingBar.show();
    //  console.log('scene assests start loading', arguments);
  };

  manager.onError = function () {
    console.log('scene assests error loading', arguments);
  };
  manager.onProgress = function (element, current, max) {
    loadingBar.set(element, current, max);
    // console.log('scene assests progress loading', arguments);
  };

  manager.onLoad = function () {
    //  console.log('scene assests loaded', arguments);
    loadingBar.hide();

    loadedhandler();
  };
}
