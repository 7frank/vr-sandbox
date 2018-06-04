import {createHTML} from './dom-utils';

import {getWorldPosition, toast} from './aframe-utils';
import {getPlayer} from '../game-utils';

function getMeaningfulnameFromRegionEl (el) {
  var id = el.getAttribute('id');
  if (id) return id;
  let src = el.getAttribute('editable-region').src;

  if (!src) return '<undefined>';
  return src.substring(src.lastIndexOf('/') + 1, src.length).split('.')[0];
}

function createTeleportLocationButtons () {
  var btns = document.querySelectorAll('[editable-region]').toArray().map(function (el) {
    let name = getMeaningfulnameFromRegionEl(el);

    let style = `     background: rgba(43, 9, 229, 0.4);
    border-radius: 10px;
    color: lightgrey;
    margin-right: 0.5em;
    `;

    let btn = AFRAME.nk.parseHTML(`<button style="${style}">${name}</button>`);
    btn.addEventListener('click', function () {
      toast('teleporting to:' + name);
      let regionPosition = getWorldPosition(el.object3D);
      regionPosition.y = 1;
      getPlayer().setAttribute('position', regionPosition);
    });
    return btn;
  });
  return btns;
}

function createDroplet (caption) {
  let headStyle = ` 
    background: rgba(0,0,0,0.6);
    padding:0.2em;
    color:lightgrey;
    user-select: none;
    font-family: monospace;
    `;

  let bodyStyle = `
     background:rgba(235, 225, 225, 0.37);
    padding:0.2em;
    user-select: none;
      color: #7266dc;
      font-family: monospace;
    `;

  var d = createHTML(`<div ></div>`);
  d.innerHTML = `<div id="head" style="${headStyle}">${caption}</div><div id="body" style="${bodyStyle}"></div>`;
  d.head = d.querySelector('#head');
  d.body = d.querySelector('#body');

  return d;
}

function createActiveTargetPanel () {
  var container = createDroplet('Active Element');

  function
  getActiveElName (el) {
    return (el.getAttribute ? el.getAttribute('id') || el.getAttribute('name') : null) || el.tagName.toLowerCase();
  }

  document.querySelector('[cursor-focus]').addEventListener('change', function ({detail}) {
    var name = getActiveElName(detail);
    container.body.innerHTML = name;
  });
  return container;
}

function createHotkeysDebugLog () {
  var hotkeyLog = createDroplet('Hotkey Info');

  AFRAME.nk.Hotkeys.onAction(function (e) {
    hotkeyLog.body.innerHTML = `<div >Action:  <span style="color:white">${e.type}</span></div><div >Trigger:  <span style="color:white">${e.detail.combo.combo}</span></div>`;
  });

  return hotkeyLog;
}

// TODO
export function createSidebarMenu () {
  let style = `
    position: absolute;
    top: 0em;
    left: 0em;
        width: 15%;
    `;

  let parent = createHTML(`<div style="${style}"></div>`);

  //

  let activeElInfo = createActiveTargetPanel();
  parent.append(activeElInfo);

  var log = createHotkeysDebugLog();
  parent.append(log);

  var locations = createDroplet('Teleport to Region');
  parent.append(locations);

  var btns = createTeleportLocationButtons();
  btns.forEach(btn => locations.body.appendChild(btn));

  document.querySelector('body').append(parent);
}
