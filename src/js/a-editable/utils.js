import $ from 'jquery';

export function getHotkeyDialog () {
  return document.querySelector('nk-hotkey-dialog');
}

var textEditor;

export function getTextEditorInstance () {
  if (textEditor) return textEditor;
  textEditor = $(`<a-entity class="text" look-at="src:.player" position="0 -1 2"></a-entity>`);
  return textEditor;
}
