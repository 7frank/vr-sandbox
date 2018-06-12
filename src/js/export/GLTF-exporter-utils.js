import 'three/examples/js/exporters/GLTFExporter.js';
import {toast} from '../utils/aframe-utils';
import {getCursor, getCursorComponent, getIntersectedEl} from '../game-utils';

var _exporter;

/**
 *
 * @param {HTMLElement|Array[HTMLElement]|NodeList} obj
 */
export function exportGLTF (obj) {
  if (!_exporter) _exporter = new Exporter();

  _exporter.export(obj, {binary: true});
}

export function exportElementUnderCursor () {
  var intersected = getIntersectedEl();

  if (!intersected) toast('to export, look at something first ');

  exportGLTF(intersected);
  // intersected .tagName
}

window.exportElementUnderCursor = exportElementUnderCursor;

// src: https://github.com/fernandojsg
// same code but some changes

class Exporter {
  constructor () {
    this.init();
  }

  init () {
    this.link = document.createElement('a');
    this.link.style.display = 'none';
    document.body.appendChild(this.link);

    this.exporter = new THREE.GLTFExporter();
  }

  download (blob, filename) {
    this.link.href = URL.createObjectURL(blob);
    this.link.download = filename;
    this.link.click();
  }

  downloadBinary (value, filename) {
    this.download(new Blob([value], {type: 'application/octet-stream'}), filename);
  }

  downloadJSON (text, filename) {
    this.download(new Blob([text], {type: 'application/json'}), filename);
  }

  export (input, options) {
    var inputObject3D;

    if (typeof input === 'undefined') throw new Error('no entity provided');

    if (input instanceof Array) {
      inputObject3D = input.map(function (entity) {
        return entity.object3D;
      });
    } else if (input instanceof NodeList) {
      inputObject3D = Array.prototype.slice.call(input).map(function (entity) {
        return entity.object3D;
      });
    } else {
      inputObject3D = input.object3D;
    }

    var self = this;
    this.exporter.parse(inputObject3D, function (result) {
      if (options && options.binary === true) {
        self.downloadBinary(result, 'scene.glb');
      } else {
        var output = JSON.stringify(result, null, 2);

        self.downloadJSON(output, 'scene.gltf');
      }
    }, options);
  }
}
