import template from './asset-menu.hbs';
import {createHTML} from '../utils/dom-utils';
import {getHUD} from '../game-utils';
import {MainMenuStack} from '../types/MenuStack';

export let MainOpenFileDialogInstance;

export function showAssetDialog () {
  if (!MainOpenFileDialogInstance) {
    MainOpenFileDialogInstance = new AssetDialog();
    MainOpenFileDialogInstance.toggle();
  } else {
    MainOpenFileDialogInstance.toggle();
  }
}

class AssetDialog {
  constructor () {
    let tpl = template({
      title: 'File Dialog!',
      datasource: 'assets-ds-x' //  'assets-ds-temp'
    });
    this.menu = createHTML(tpl);
    getHUD().append(this.menu);
  }

  isVisible () {
    return this.menu.getAttribute('visible');
  }

  toggle () {
    if (this.isVisible()) {
      MainMenuStack.pop();
    } else {
      MainMenuStack.push('asset-select-menu');
    }
  }
}
