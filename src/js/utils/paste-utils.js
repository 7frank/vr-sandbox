/**
 * @author {@link https://ourcodeworld.com/articles/read/491/how-to-retrieve-images-from-the-clipboard-with-javascript-in-the-browser}
 * This handler retrieves the images from the clipboard as a blob and returns it in a callback.
 *
 * TODO erfactor/extend and support text and other useful formats
 * https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/
 *
 *
 * @param pasteEvent
 * @param callback
 */
export function retrieveImageOrTextFromClipboardAsBlob (pasteEvent, callback) {
  if (pasteEvent.clipboardData == false) {
    if (typeof (callback) == 'function') {
      callback(undefined);
    }
  }

  var items = pasteEvent.clipboardData.items;

  if (items == undefined) {
    if (typeof (callback) == 'function') {
      callback(undefined);
    }
  }

  for (var i = 0; i < items.length; i++) {
    // Skip content if not image
    if (items[i].type.indexOf('image') == -1) {
      // Retrieve image on clipboard as blob

      var blob = items[i].getAsFile();

      if (typeof (callback) == 'function') {
        callback(blob, 'image');
      }
    } else
    if (items[i].type.indexOf('text') == -1) {
      // Retrieve image on clipboard as blob

      var str = items[i].getAsString();

      if (typeof (callback) == 'function') {
        callback(str, 'text');
      }
    }
  }
}
