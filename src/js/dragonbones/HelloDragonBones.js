import {Model} from './model';
import {BaseDemo} from './BaseDemo';

export
class HelloDragonBones extends BaseDemo {
    testModel;

    constructor () {
      super();

      this.root = 'assets/dragonbones/mecha_1002_101d_show/';

      /* this.testModel = new Model();
      this.testModel.setRoot('assets/dragonbones/mecha_1002_101d_show/')
        .setSkeleton('mecha_1002_101d_show_ske.dbbin')
        .setJSONTexture('mecha_1002_101d_show_tex.json')
        .setTexture('mecha_1002_101d_show_tex.png');

      console.log('model', this.testModel);
*/
      this._resources.push(
        // "resource/mecha_1002_101d_show/mecha_1002_101d_show_ske.json",
        this.root + 'mecha_1002_101d_show_ske.dbbin',
        this.root + 'mecha_1002_101d_show_tex.json',
        this.root + 'mecha_1002_101d_show_tex.png'
        /*
        'assets/dragonbones/Ubbie_1/Ubbie_1_ske.dbbin',
        'assets/dragonbones/Ubbie_1/Ubbie_1_tex.json',
        'assets/dragonbones/Ubbie_1/Ubbie_1_tex.png',

        'assets/dragonbones/mecha_2903/mecha_2903_ske.json',
        'assets/dragonbones/mecha_2903/mecha_2903_tex.json',
        'assets/dragonbones/mecha_2903/mecha_2903_tex.png' */

      /*  this.testModel.skeleton,
        this.testModel.jsontexture,
        this.testModel.texture */
      );
    }

    _onStart () {
      const factory = dragonBones.ThreeFactory.factory;
      // factory.parseDragonBonesData(this._pixiResource["resource/mecha_1002_101d_show/mecha_1002_101d_show_ske.json"].data);
      factory.parseDragonBonesData(this._loadedResources[this.root + 'mecha_1002_101d_show_ske.dbbin']);
      factory.parseTextureAtlasData(this._loadedResources[this.root + 'mecha_1002_101d_show_tex.json'], this._loadedResources[this.root + 'mecha_1002_101d_show_tex.png']);

      const armatureDisplay = factory.buildArmatureDisplay('mecha_1002_101d', 'mecha_1002_101d_show');
      armatureDisplay.animation.play('idle');

      armatureDisplay.position.setX(20.0);
      armatureDisplay.position.setY(120.0);
      this.add(armatureDisplay);

      // -------------------
      /*
      factory.parseDragonBonesData(this._loadedResources['assets/dragonbones/Ubbie_1/Ubbie_1_ske.dbbin']);
      factory.parseTextureAtlasData(this._loadedResources['assets/dragonbones/Ubbie_1/Ubbie_1_tex.json'], this._loadedResources['assets/dragonbones/Ubbie_1/Ubbie_1_tex.png']);

      factory.parseDragonBonesData(this._loadedResources['assets/dragonbones/mecha_2903/mecha_2903_ske.json']);
      factory.parseTextureAtlasData(this._loadedResources['assets/dragonbones/mecha_2903/mecha_2903_tex.json'], this._loadedResources['assets/dragonbones/mecha_2903/mecha_2903_tex.png']);
      global.factory = factory;
      global.that = this;

      const armatureDisplay2 = factory.buildArmatureDisplay('mecha_2903', 'mecha_2903');
      armatureDisplay2.animation.play('idle');

      armatureDisplay2.position.setX(0.0);
      armatureDisplay2.position.setY(200.0);

      this.add(armatureDisplay2);
*/
      // -------------------

      //   const armatureDisplay3 = this.testModel.createModelInstance(this._loadedResources, 'mecha_1002_101d', 'mecha_1002_101d_show');
      //   this.add(armatureDisplay3);

      this.el1 = armatureDisplay;
      // this.el2 = armatureDisplay2;
    }
}
