
export function createCubeTexture (opts) {
  var urls, textureCube;
  var cube = new TextureCube();
  var WellKnownUrls = cube.getWellKnownUrls();
  // handle parameters polymorphisms
  if (arguments.length === 2) {
    var path = arguments[0];
    var format = arguments[1];
    urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];
  } else if (typeof (opts) === 'string') {
    console.assert(WellKnownUrls[opts], 'no tQuery.TextureCube.WellKnownUrls for ' + opts);
    urls	= WellKnownUrls[opts];
  } else if (opts instanceof THREE.Texture) {
    textureCube	= opts;
    return textureCube;
  } else if (opts instanceof Array) {
    urls	= opts;
  } else if (opts instanceof Object) {
    console.assert(opts.path, 'opts.path must be defined');
    console.assert(opts.format, 'opts.format must be defined');
    urls	= [
      opts.path + 'px' + opts.format, opts.path + 'nx' + opts.format,
      opts.path + 'py' + opts.format, opts.path + 'ny' + opts.format,
      opts.path + 'pz' + opts.format, opts.path + 'nz' + opts.format
    ];
  } else	console.assert(false, 'opts invalid type ' + opts);
  // sanity check
  console.assert(urls.length === 6);
  // create the textureCube
  textureCube	= THREE.ImageUtils.loadTextureCube(urls);
  // return it
  return textureCube;
}

/** @namespace */

class TextureCube {
  constructor (opts) {
    this.baseUrl	= 'assets/skymap/cube';
  }

  /**
     * To create urls compatible with THREE.ImageUtils.loadTextureCube
     */

  createUrls (basename, format, rootUrl, posPrefix, negPrefix) {
    posPrefix	= posPrefix || 'p';
    negPrefix	= negPrefix || 'n';
    var path	= rootUrl + '/' + basename + '/';
    var urls	= [
      path + posPrefix + 'x' + format, path + negPrefix + 'x' + format,
      path + posPrefix + 'y' + format, path + negPrefix + 'y' + format,
      path + posPrefix + 'z' + format, path + negPrefix + 'z' + format
    ];
    return urls;
  }

  /**
     *TODO predefine once
     *  predefined urls compatible with THREE.ImageUtils.loadTextureCube.
     * They points toward the cube maps in plugins/assets
     */

  getWellKnownUrls () {
    var rootUrl		= this.baseUrl;

    var wellKnownUrls	= {};

    wellKnownUrls['bridge2']		= this.createUrls('Bridge2', '.jpg', rootUrl, 'pos', 'neg');
    wellKnownUrls['escher']			= this.createUrls('Escher', '.jpg', rootUrl);
    wellKnownUrls['park2']			= this.createUrls('Park2', '.jpg', rootUrl, 'pos', 'neg');
    wellKnownUrls['park3Med']		= this.createUrls('Park3Med', '.jpg', rootUrl);
    wellKnownUrls['pisa']			= this.createUrls('pisa', '.png', rootUrl);
    wellKnownUrls['skybox']			= this.createUrls('skybox', '.jpg', rootUrl);
    wellKnownUrls['swedishRoyalCastle']	= this.createUrls('SwedishRoyalCastle', '.jpg', rootUrl);

    wellKnownUrls['mars']			= this.createUrls('mars', '.jpg', rootUrl);

    // copy result
    return wellKnownUrls;
  }
}
