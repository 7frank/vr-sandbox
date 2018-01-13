/**
 * helper to be able to configure the controls for an a-entity
 *
 *
 */

import $ from 'jquery';
import './DialogComponent.css';

/**
 * simple basic dialog
 *
 *
 */

export default class DialogComponent {
  constructor () {
    this.createDialog();
  }

  createDialog () {
    var dialog = this.$ = this._dialog_ = $('<div>').addClass('DialogComponent');

    // FIXME css loader does not add css for inline css
    dialog.attr('style', `
    
    display:none;
    position:absolute;
    left:20%;
    top:20%;
    bottom:20%;
    right:20%;
    background-color: rgba(255,255,255,0.3);
    overflow: auto;
    padding: 1em;
   
    `);

    var closer = $('<span>').addClass('closer').html('x');
    closer.on('click', function () {
      dialog.hide().remove();
    });

    var head = this._head_ = $('<div>').addClass('head').append(closer);
    var body = this._body_ = $('<div>').addClass('body');

    dialog.append(head, body);

    dialog.show().appendTo('body');
    return dialog;
  }

  setCaption (caption) {
    this._head_.html(caption);
    return this;
  }

  setBody (content) {
    this._body_.html(content);
    return this;
  }
}
