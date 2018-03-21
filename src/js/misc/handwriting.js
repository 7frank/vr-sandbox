// @author Ken Fyrstenberg - https://www.codementor.io/epistemex/how-to-make-a-write-on-effect-using-html5-canvas-and-javascript-only-du107si9v

export
function renderTextToCanvas (canvas, txt = 'STROKE-ON CANVAS', speed = 5, font = '50px Comic Sans MS', done = function () {}) {
  // get 2D context
  var ctx = canvas.getContext('2d'),

    // dash-length for off-range
    dashLen = 220,

    // we'll update this, initialize
    dashOffset = dashLen,

    // some arbitrary speed
    // speed = 5,

    // the text we will draw
    // txt = "STROKE-ON CANVAS",

    // start position for x and iterator
    x = 30, i = 0;

  var iterator = (fn) => requestAnimationFrame(fn);
  // var iterator = (fn) => setTimeout(fn, 33);

  /**
     * Then let's set up some font and color style for the canvas context:
     *
     */

  // Comic Sans?? Let's make it useful for something ;) w/ fallbacks
  ctx.font = font + ', cursive, TSCu_Comic, sans-serif';

  // thickness of the line
  ctx.lineWidth = 3;

  // to avoid spikes we can join each line with a round joint
  ctx.lineJoin = 'round';

  // increase realism letting background (f.ex. paper) show through
  ctx.globalAlpha = 2 / 3;

  // some color, lets use a black pencil
  ctx.strokeStyle = ctx.fillStyle = '#000';

  /**
     * animation code
     */
  (function loop () {
    // clear canvas for each frame
    ctx.clearRect(x, 0, 60, 150);

    // calculate and set current line-dash for this char
    ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]);

    // reduce length of off-dash
    dashOffset -= speed;

    // draw char to canvas with current dash-length
    ctx.strokeText(txt[i], x, 90);

    // char done? no, the loop
    if (dashOffset > 0) requestAnimationFrame(loop);
    else {
      // ok, outline done, lets fill its interior before next
      ctx.fillText(txt[i], x, 90);

      // reset line-dash length
      dashOffset = dashLen;

      // get x position to next char by measuring what we have drawn
      // notice we offset it a little by random to increase realism
      x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();

      // lets use an absolute transform to randomize y-position a little
      ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());

      // and just cause we can, rotate it a little too to make it even
      // more realistic
      ctx.rotate(Math.random() * 0.005);

      // if we still have chars left, loop animation again for this char
      if (i < txt.length) iterator(loop);
      else done();
    }
  })(); // just to self-invoke the loop
}

export
function createTextSampleCanvas () {
  var canvas = document.createElement('canvas');
  canvas.setAttribute('style', 'position:absolute;top:20%;left:20%;width:60%;height:60%');

  document.body.append(canvas);

  createHiDPICanvas(canvas, canvas.width * 2, canvas.height * 2);
  renderTextToCanvas(canvas, 'Loading ...', 100, '70px Comic Sans MS', function () {
    canvas.parentElement.removeChild(canvas);
  });

  return canvas;
}
var PIXEL_RATIO = (function () {
  var ctx = document.createElement('canvas').getContext('2d'),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

  return dpr / bsr;
})();

function createHiDPICanvas (canvas, w, h, ratio) {
  if (!ratio) { ratio = PIXEL_RATIO; }
  var can = canvas || document.createElement('canvas');
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + 'px';
  can.style.height = h + 'px';
  can.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
}
