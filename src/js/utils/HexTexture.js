import {HexagonGrid} from './hexgrid';

/**
 * base class for canvas based texture generation
 * @deprecated FIXME bug importing from animation lib ... something with babel
 */

export class CanvasTexture {
  constructor (width = 512, height = 512) {
    this.width = width;
    this.height = height;

    this.createCanvas();
  }

  createCanvas () {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx = this.canvas.getContext('2d');
    return this;
  }

  getCanvas () {
    return this.canvas;
  }

  getDataURL () {
    return this.canvas.toDataURL();
  }

  getDataTexture () {
    let canvas = this.canvas;

    var canvasData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

    var data = new Uint8Array(canvasData.data);
    let texture = new THREE.DataTexture(data, canvas.width, canvas.height, THREE.RGBAFormat);
    texture.needsUpdate = true;

    return texture;
  }

  /**
     * TODO convert the texture into positional information
     */
  getVectorDataTexture () {
    throw new Error('missing implementation');
  }

  getTexture () {
    return new THREE.Texture(this.canvas);
  }
}

export class HexTexture extends CanvasTexture {
  drawHexGrid (cellRadius = 64, rows = 10, cols = 10, originX = 0, originY = 0) {
    let ctx = this.ctx;
    let canvas = this.canvas;

    var hexagonGrid = new HexagonGrid(canvas, cellRadius);
    hexagonGrid.setColors('transparent', '#000').drawHexGrid(rows, cols, originX, originY, false);

    return this;
  }
}
