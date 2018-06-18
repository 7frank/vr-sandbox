import {createHTML} from './dom-utils';

import {getWorldPosition, toast} from './aframe-utils';
import {getCursor, getPlayer} from '../game-utils';
import * as _ from 'lodash';

function getMeaningfulnameFromRegionEl (el) {
  var id = el.getAttribute('id');
  if (id) return id;
  let src = el.getAttribute('editable-region').src;

  if (!src) return '<undefined>';
  return src.substring(src.lastIndexOf('/') + 1, src.length).split('.')[0];
}

function createButton (name) {
  let style = `     background: rgba(43, 9, 229, 0.4);
    border-radius: 10px;
    color: lightgrey;
    margin-right: 0.5em;
    `;

  let btn = AFRAME.nk.parseHTML(`<button style="${style}">${name}</button>`);
  return btn;
}

function createTeleportLocationButtons () {
  var btns = document.querySelectorAll('[editable-region]').toArray().map(function (el) {
    let name = getMeaningfulnameFromRegionEl(el);

    let style = `     background: rgba(43, 9, 229, 0.4);
    border-radius: 10px;
    color: lightgrey;
    margin-right: 0.5em;
    `;

    let btn = createButton(name);
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
    if (!el) return '-undefined-';
    return (el.getAttribute ? el.getAttribute('id') || el.getAttribute('name') : null) || el.tagName.toLowerCase();
  }

  document.querySelector('[cursor-focus]').addEventListener('focus-change', function ({detail}) {
    // console.log('focus-change', detail);
    var name = getActiveElName(detail);

    let els = document.querySelector('[raycaster]').components.raycaster.intersectedEls;
    let names = els.map(getActiveElName).join(' ');

    container.body.innerHTML = `${name}<hr>${names}`;
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

/**
 *
 * @param {HTMLElement} parent - the oarent container that contains one or more child elements with with the id parameter
 * @param {string} ids - comma separated list of id
 */
export
function showMenu (parent, ids) {
  ids = ids.split(', ').map(n => n.trim());

  let menus = parent.childNodes.toArray().filter(n => n.nodeType != 3);
  _.each(menus, function (node, k) {
    node.setAttribute('visible', ids.indexOf(node.getAttribute('id')) >= 0);
    node.flushToDOM();
  });
}

function createMenuSelect () {
  var container = createDroplet('Menu Select');

  let menus = document.querySelector('[hud-hud]').childNodes.toArray().filter(n => n.nodeType != 3);

  _.each(menus, function (node, k) {
    let btn = createButton(node.getAttribute('id') || '<no-id>');
    btn.addEventListener('click', function () {
      _.each(menus, (el) => el.setAttribute('visible', false));

      node.setAttribute('visible', true);

      node.flushToDOM();
    });
    container.append(btn);
  });

  return container;
}

// TODO
export function createSidebarMenu () {
  let style = `
    position: absolute;
    top: 1em;
    right: 0em;
        width: 15%;
        height: 80vh;
    overflow-y: auto;
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

  var menus = createMenuSelect();
  parent.append(menus);

  document.querySelector('body').append(parent);
  return parent;
}

export function createSidebarToggleIcon () {
  let style = `
    position: absolute;
    top: 0em;
    right: 0em;   
    `;

  function toggleEl (el) {
    el.style.display = el.style.display == 'none' ? 'block' : 'none';
  }

  let parent = createHTML(`<div style="${style}">💡</div>`);
  var instance;
  parent.addEventListener('click', () => {
    if (!instance) {
      instance = createSidebarMenu();
    } else {
      toggleEl(instance);
    }
  });

  document.querySelector('body').append(parent);
}
