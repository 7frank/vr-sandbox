
export
class BaseDemo extends THREE.Group {
  /*  private static readonly BACKGROUND_URL: string = "resource/background.png";
    private readonly _scene: THREE.Scene = new THREE.Scene();
    protected readonly _camera: THREE.OrthographicCamera = new THREE.OrthographicCamera(-0.5, 0.5, -0.5, 0.5, -1000, 1000);
    protected readonly _renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true  });

    private readonly _background: THREE.Sprite = new THREE.Sprite();
    protected readonly _resources: string[] = [BaseDemo.BACKGROUND_URL];
    protected readonly _loadedResources: dragonBones.Map<any | ArrayBuffer | THREE.Texture> = {};
*/

  init () {
    this._resources = [];
    this._loadedResources = {};
  }

  constructor () {
    super();
    this.init();
    setTimeout(() => {
      this._loadResources();
    }, 10);
  }

  _startTick () {
    const update = () => {
      dragonBones.ThreeFactory.factory.dragonBones.advanceTime(-1.0);
      //  this._renderer.render(this._scene, this._camera);
      requestAnimationFrame(update);
    };

    update();
  }

  _loadResources () {
    for (const resource of this._resources) {
      if (resource.indexOf('dbbin') > 0) {
        const loader = new THREE.FileLoader();
        loader.setResponseType('arraybuffer');
        loader.load(resource, (result) => {
          this._loadedResources[resource] = result;
        });
      } else if (resource.indexOf('.png') > 0) {
        const loader = new THREE.TextureLoader();
        this._loadedResources[resource] = loader.load(resource);
      } else {
        const loader = new THREE.FileLoader();
        loader.setResponseType('json');
        loader.load(resource, (result) => {
          this._loadedResources[resource] = result;
        });
      }
    }

    THREE.DefaultLoadingManager.onLoad = () => {
      //
      this._startTick();
      this._onStart();
    };
  }
}
