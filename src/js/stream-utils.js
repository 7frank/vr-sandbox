// TODO check out libraries that handle different types of stream chunks instead?
export function streamIn (url) {
  // var test = true;
  // if (test) throw new Error('test');

  return fetch(url)
    .then(fetchHandleErrors) // this is neceassary for 404 errors to bubble
    .then((response) => {
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start (controller) {
        // Die folgende Funktion behandelt jeden Daten-Chunk
          function push () {
          // "done" ist ein Boolean und "value" ein "Uint8Array"
            return reader.read().then(({done, value}) => {
            // Gibt es weitere Daten zu laden?
              if (done) {
              // Teile dem Browser mit, dass wir fertig mit dem Senden von Daten sind
              // / TODO throws error

                controller.close();
                return;
              }

              // Bekomme die Daten und sende diese an den Browser durch den Controller weiter
              controller.enqueue(value);
            }).then(push);
          }

          push();
        }
      });

      return new Response(stream, {headers: {'Content-Type': 'text/html'}});
    });
}

export function Blob2Text (blb) {
  return new Promise(function (resolve, reject) {
    // const blb    = new Blob(["Lorem ipsum sit"], {type: "text/plain"});

    const reader = new FileReader();

    // This fires after the blob has been read/loaded.
    reader.addEventListener('loadend', (e) => {
      const text = e.srcElement.result;
      resolve(text);
    });

    reader.addEventListener('onerror', reject);

    // Start reading the blob as text.
    reader.readAsText(blb);
  });
}

/* quick 404 trigger for fetch via then */

export
function fetchHandleErrors (response) {
  if (!response.ok) {
    var err = new Error(response);
    err.status = response.status;
    err.statusText = response.statusText;
    err.url = response.url;
    throw err;
  }
  return response;
}