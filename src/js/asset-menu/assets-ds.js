import template from './asset-menu.hbs';
import {getHUD, getScene} from '../game-utils';
import {MainMenuStack} from '../types/MenuStack';
import {createHTML} from '../utils/dom-utils';

export function showAssetDialog () {
  let tpl = template();
  window['fu'] = {template, menu, getHUD};
  let menu = createHTML(tpl);
  getHUD().append(menu);

  MainMenuStack.push('asset-select-menu');
}

window['showAssetDialog'] = showAssetDialog;

/*
 create dialog from template
 show hide
    ...
  ds from dropped files
  and others

  improve look and feel of dialog

*/
AFRAME.registerComponent('assets-ds', {
  dependencies: ['data-array'],
  schema: {},
  init: function () {
    let dataArrayData = this.el.components['data-array'].data;
    let observableDataArray = dataArrayData.items;

    const value = {url: 'http:localhost:3000/test.file', name: 'test.file', size: '123'};

    observableDataArray.push({key: -1, value});

    getScene().addEventListener('file-dropped', ({detail}) => {
      console.log('droppend in asset-ds', detail);

      observableDataArray.push({key: -1, value: detail});
    });
  }
});
