
import {createGeneralOptionsDialog} from './gui/dialogs/options/OptionDialog';
import {createHTML, setCenter} from './utils/dom-utils';
import $ from 'jquery';

var optionsDialog;
var dlg;

function createOD () {
  if (!optionsDialog) {
    optionsDialog = createGeneralOptionsDialog();

    // dialog -------------------------------------

    dlg = createHTML("<nk-window title='Options Dialog' class='card card-1'>");
    dlg.appendChild(optionsDialog.$el);
    dlg.closingAction = 1; // hide on close //FIXME

    document.body.appendChild(dlg);
    // TODO implementation: setCenter on appendCallback via "center" attribute in nk-window
    setCenter(dlg);
  } else $(dlg).toggle();
}

export
function openOptionsDialog (id) {
  if (!optionsDialog) {
    createOD();
    var tab = optionsDialog.$children[0];
    setTimeout(() => tab.setActiveTab(id), 1);
  } else {
    var tab = optionsDialog.$children[0];
    if (tab.activeTabId == id) {
      $(dlg).toggle();
    } else {
      setTimeout(() => tab.setActiveTab(id), 1);
      $(dlg).show();
    }
  }
}
