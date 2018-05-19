/**
 * FIXME don't rely on global
 * @param actionName
 */
export function getDescriptiveTextForAction (actionName) {
  if (!AFRAME.nk.Hotkeys || !AFRAME.nk.Hotkeys.getRegistered) { return '[' + actionName + ']'; }

  var action = AFRAME.nk.Hotkeys.getRegistered()[actionName];

  if (!action) return '[undefined]';

  return action.combo.map(c => `[${c.type}:${c.combo}]`).join(' ');
}
