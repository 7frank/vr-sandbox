/**
 *
 */

import MutationSummary from 'mutation-summary';
import {each} from 'lodash';

/**
 * NOTE: not working for a-frame components and attributes {@link https://github.com/aframevr/aframe/issues/3028}
 * use a-farme component events instead {@link https://aframe.io/docs/0.6.0/core/entity.html#events_componentchanged}
 *
 * @param node
 * @param attr
 * @param handler
 * @returns {MutationSummary}
 */
export function onAttributeChange (node = window.document, attr, handler) {
  var observer = new MutationSummary({
    callback: handler, // required
    rootNode: node, // optional, defaults to window.document
    //  observeOwnChanges: // optional, defaults to false
    // oldPreviousSibling: // optional, defaults to false
    queries: [
      {
        // element: '[' + attr + ']'
        attribute: attr

      }
      //  { /* query2 */ },
      // …
      //  { /* queryN */ }
    ]
  });

  // If/when change report callbacks are no longer desired
  // var summaries = observer.disconnect();
  // if (summaries)
  //     handleChangesUpToHere(summaries);
  return observer;
}

export function onTagChanged (tagName, handler) {
  onElementChange(undefined, tagName, function (evt) { handler(evt[0]); });
}

export function onElementChange (node = window.document, elem, handler) {
  var observer = new MutationSummary({
    callback: handler, // required
    rootNode: node, // optional, defaults to window.document
    //  observeOwnChanges: // optional, defaults to false
    // oldPreviousSibling: // optional, defaults to false
    queries: [
      {
        element: elem // '[' + elem + ']'

      }
    ]
  });

    // If/when change report callbacks are no longer desired
    // var summaries = observer.disconnect();
    // if (summaries)
    //     handleChangesUpToHere(summaries);
  return observer;
}

/**
 * the actual attribute listener if the attribute is an a-frame omponent
 *
 *
 * @param node
 * @param attr
 * @param handler
 */
export function onAFrameAttributeChange (node, attr, handler) {
  node.addEventListener('componentchanged', function (evt) {
    if (evt.detail.name === attr) {
      handler(evt);
    }
  });
}

/**
 * TODO find meaninful name ..
 * TODO throttle changes probably by syncing with current animation loop
 * @param attr
 * @param changeHandler
 */
export function onXYZAFrameChange (attr = '[position]', changeHandler) {
  onElementChange(undefined, attr, function (arr) {
    each(arr[0].added, function (v, k) {
      onAFrameAttributeChange(v, 'position', changeHandler);
    });

    // console.log('added position change event');
  });
}
