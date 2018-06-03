/**
 * FIXME don't rely on global
 * @param actionName
 */
import * as _ from 'lodash';

export function getDescriptiveTextForAction (actionName) {
  if (!_.has(AFRAME, 'nk.Hotkeys.getRegistered')) { return '"' + actionName + '"'; }

  var action = AFRAME.nk.Hotkeys.getRegistered()[actionName];

  if (!action) return '"undefined"';

  return action.combo.map(c => {
    let type = c.type == 'keyboard' ? '' : c.type;
    return `"${type}${_.capitalize(c.combo)}"`;
  }).join(' ');
}
