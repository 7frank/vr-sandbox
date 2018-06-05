
// --------------------------------------
/**
 * edit currently focused entity
 * TODO
 *
 *
 * @deprecated refactor useful parts
 */
function reloadSceneToDOM () {
    // var loadingInfoText = createTextSampleCanvas();

    var elem = document.querySelector('.overlay-editor .content-area');

    var content = require('../staticContent.hbs');

    elem.value = content();

    // deprecated ---------------------------------------------

    function staticUpdateScene () {
        var sceneDefinition = require('../sceneDefinition.hbs');

        var copy = $(sceneDefinition()).append(trim(elem.value));

        // FIXME no longer detecting loaded
        /*  copy.get(0).addEventListener('loaded', function () {
                                                                  console.log('scene was loaded');
                                                                  setTimeout(function () {
                                                                    copy.attr('visible', true);
                                                                  }, 500);
                                                                }); */

        $('a-scene').replaceWith(copy);

        // ----------------------------------
    }

    function diffUpdateScene () {
        // TODO test if the diffing has the wanted result of increasing load times of area as well as reducing uneccessary computations
        var dd = new DiffDOM();

        var sceneOld = $('a-scene').get(0);
        var sceneNew = $('<a-scene>').append(trim(elem.value)).get(0);

        var diff = dd.diff(sceneOld, sceneNew);
        console.log(sceneOld, sceneNew, diff);
        // dd.apply(sceneOld, diff);
    }

    // @deprecated TODO refactor - have the editing be part of a region rather than the whole scene

    /* function initSceneFromTextarea (staticUpdate = true) {
      console.log('changed');

      if (staticUpdate) {
        staticUpdateScene();
      } else {
        diffUpdateScene();
      }
    } */

    // initSceneFromTextarea();
    // elem.addEventListener('keypress', debounce(initSceneFromTextarea, 2000));
}