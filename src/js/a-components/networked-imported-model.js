import {updateHotComponent} from '../utils/aframe-debug-utils';
import {createHTML} from '../utils/dom-utils';
import {Logger} from '../utils/Logger';
import {renderGLTFOrGlbURL, renderZipFile, addControlsToModel} from '../sketchfab/sketchfab-render';
import {importModel} from '../sketchfab/sketchfab-browser';
/**
 * A component that handles the networked distribution of locally imported models
 * - (requirement) A model gets imported and stored to local file storage or ... this storage is accessible.
 * -
 * Problem: (1) say we import files from sketchfab-aws that are only there for a certain amount of time
 *          => we'll need oto have the original url from the sketchfab import window
 *              e.g. (result.model.uri == "https://api.sketchfab.com/v3/models/429e0904ae0d40acb650d01b6b05a797") +/download
 *              and re-run the whole process for the user that gets the networked info to import a model
 *          => the user gets a dialog where he has to confirm import and probably do login in some way or the other
 *          => https://sketchfab.com/developers/oauth
 *
 *          (2) a user creates content locally and imports it via drag&drop
 *          => he should have a cloud storage connected where files are uploaded from where the sync will happen
 *          => for simplicity we can/could use the sketchfab upload/export
 */

/*
FileStorage
{
    map<OriginalURL,localOrMemoryURL>:{}

   onImport => !lookUpLocalExists
            => push to map

}
*/

/**
 * For simplicity and to circumvent the ooauth and registration for sketchfab we'll use the temporary url given by the importer.
 * This will probably only allow local tests without the user login into sketchfab via the import dialog first.
 *
 *
 */

var console = Logger.getLogger('networked-imported-model');

updateHotComponent('networked-imported-model');
AFRAME.registerComponent('networked-imported-model', {
  schema: {
    src: {type: 'string', default: null}
  },
  init: function () {
    console.log('networked-imported-model', this, this.data);
  },
  update: function () {
    var that = this;
    var url = this.data.src;
    if (!url) { console.warn('src invalid'); } else {
      console.log('loading', url);

      // import model and append
      importModel(url).then(function (modelEl) {
        that.el.append(modelEl);
        addControlsToModel(modelEl);
      }).catch(e => console.error('import model', e));
    }
  }
});
