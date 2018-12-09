
export
class Model {
  /*   root//: string;
    skeleton//: string;
    jsontexture//: string;
    texture: //string;
*/

  setRoot (directoryName) {
    this.root = directoryName;
    return this;
  }

  setSkeleton (filename) {
    this.skeleton = filename;

    return this;
  }

  setJSONTexture (filename) {
    this.jsontexture = filename;

    return this;
  }

  setTexture (filename) {
    this.texture = filename;

    return this;
  }

  /**
     * TODO resuources show be handled per model loaded not globally?
     * @param resources
     * @param {string} armatureName
     * @param {string | null} dragonBonesName
     * @param {string | null} skinName
     * @param {string | null} textureAtlasName
     * @returns {any}
     */
  //    createModelInstance(resources:any,armatureName?:string,dragonBonesName?:string  ,skinName?:string ,textureAtlasName?:string )
  createModelInstance (resources, armatureName, dragonBonesName, skinName, textureAtlasName) {
    const factory = dragonBones.ThreeFactory.factory;
    // factory.parseDragonBonesData(this._pixiResource["resource/mecha_1002_101d_show/mecha_1002_101d_show_ske.json"].data);
    factory.parseDragonBonesData(resources[this.root + this.skeleton]);
    factory.parseTextureAtlasData(resources[this.root + this.jsontexture], resources[this.root + this.texture]);

    const armatureDisplay = factory.buildArmatureDisplay(armatureName, dragonBonesName, skinName, textureAtlasName);

    armatureDisplay.animation.play('idle');

    // armatureDisplay.position.setX(20.0);
    // armatureDisplay.position.setY(120.0);

    return armatureDisplay;
  }
}
