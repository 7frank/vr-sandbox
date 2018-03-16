/**
 * @author jbouny
 */
export
class DEMO {
  constructor () {
    this.ms_Triangles = 0;
    this.ms_Camera = null;
    this.ms_Scene = null;
    this.ms_PlaneGroup = null;
    this.ms_ProjectedGrid = null;
    this.ms_LODGrid = null;
    this.ms_GlobalTime = 0;
  }

  Initialize (el) {
    this.ms_Scene = el.object3D;

    // enable additional features of the graphics card
    el.sceneEl.renderer.context.getExtension('OES_texture_float');
    el.sceneEl.renderer.context.getExtension('OES_texture_float_linear');

    this.ms_Clock = new THREE.Clock();
    this.ms_Camera = el.sceneEl.camera;
    // General parameters
    this.ms_Animate = true;
    this.ms_Update = true;
    this.ms_Wireframe = false;
    this.ms_MeshType = 'LOD';

    // LOD parameters
    // this.ms_LODGrid = new THREE.LODGridExample(128, 7, 500, 2);
    this.ms_LODGrid = new THREE.LODGridExample(32, 10, 1500, 2);

    // Basic grid parameters
    this.ms_BasicGridResolution = 256;
    this.ms_BasicGridSize = 10000;

    // Projected grid parameter
    this.ms_GeometryResolution = 128;

    this.InitializeScene();
  }

  InitializeScene () {
    // Add light
    this.ms_MainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.ms_MainDirectionalLight.position.set(-0.2, 0.5, 1);
    this.ms_Scene.add(this.ms_MainDirectionalLight);

    // Add axis helper
    var axis = new THREE.AxisHelper(1000);
    this.ms_Scene.add(axis);

    // Initialize ProjectedGridExample
    this.ms_ProjectedGrid = new THREE.ProjectedGridExample(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
      GEOMETRY_RESOLUTION: this.ms_GeometryResolution
    });

    // Add custom geometry
    this.ChangeMesh();

    this.ChangeWireframe();
    this.ChangeAnimateMaterial();
  }

  ApplyOnGroupElements (expression) {
    if (this.ms_PlaneGroup !== null) {
      for (var i in this.ms_PlaneGroup.children) {
        expression(this.ms_PlaneGroup.children[i]);
      }
    }
  }

  ChangeWireframe () {
    var wireframe = this.ms_Wireframe;
    this.ApplyOnGroupElements(function (element) {
      element.material.wireframe = wireframe;
    });
  }

  ChangeAnimateMaterial () {
    var animate = this.ms_Animate;
    this.ApplyOnGroupElements(function (element) {
      element.material.uniforms.u_animate.value = animate;
    });
  }

  ChangeMesh () {
    if (this.ms_PlaneGroup !== null) {
      this.ms_PlaneGroup.parent.remove(this.ms_PlaneGroup);
      this.ms_PlaneGroup = null;
    }

    function optionalParameter (value, defaultValue) {
      return value !== undefined ? value : defaultValue;
    }

    var nbTriangles = 0;

    switch (this.ms_MeshType) {
      case 'LOD':
        this.LoadLOD();
        nbTriangles = Math.pow(this.ms_LODGrid.lod.lodResolution + 2, 2) * 2 * this.ms_LODGrid.lod.lodLevels;
        break;

      case 'Plane':
        this.LoadBasicGrid();
        nbTriangles = this.ms_BasicGridResolution * this.ms_BasicGridResolution * 2.0;
        break;

      default:
        this.LoadProjectedMesh();
        nbTriangles = this.ms_GeometryResolution * this.ms_GeometryResolution * 2.0;
        break;
    }

    this.ms_Triangles = Math.floor(nbTriangles);
  }

  LoadProjectedMesh () {
    var resolution = Math.round(this.ms_GeometryResolution);
    if (resolution >= 1 && resolution !== this.ms_LastGeometryResolution) {
      this.ms_LastGeometryResolution = resolution;
      var geometry = new THREE.PlaneBufferGeometry(1, 1, resolution, resolution);
      this.ms_Camera.remove(this.ms_ProjectedGrid.oceanMesh);
      this.ms_ProjectedGrid.oceanMesh.geometry = geometry;
    }

    this.ms_PlaneGroup = new THREE.Object3D();
    this.ms_PlaneGroup.add(this.ms_ProjectedGrid.oceanMesh);
    this.ms_Camera.add(this.ms_PlaneGroup);

    this.ChangeWireframe();
    this.ChangeAnimateMaterial();
  }

  LoadLOD () {
    this.ms_LODGrid.material.wireframe = this.ms_Wireframe;
    this.ms_LODGrid.generate();

    this.ms_PlaneGroup = this.ms_LODGrid.lod;
    this.ms_Camera.add(this.ms_PlaneGroup);

    this.ChangeAnimateMaterial();
  }

  LoadBasicGrid () {
    var geometry = this.ms_LODGrid.lod.generateLODGeometry(this.ms_BasicGridResolution);
    var shader = THREE.ShaderLib['example_main'];

    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(shader.uniforms),
      vertexShader: shader.buildVertexShader('default'),
      fragmentShader: shader.fragmentShader,
      side: THREE.DoubleSide,
      wireframe: this.ms_Wireframe
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(this.ms_BasicGridSize, this.ms_BasicGridSize, this.ms_BasicGridSize);

    this.ms_PlaneGroup = new THREE.Object3D();
    this.ms_PlaneGroup.add(mesh);
    this.ms_Scene.add(this.ms_PlaneGroup);

    this.ChangeAnimateMaterial();
  }

  Update () {
    this.ms_GlobalTime += this.ms_Clock.getDelta();
    var that = this;
    if (this.ms_Update) {
      this.ApplyOnGroupElements(function (element) {
        element.material.uniforms.u_time.value = that.ms_GlobalTime;
      });
    }
  }
}
