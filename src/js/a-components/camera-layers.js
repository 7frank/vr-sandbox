/**
 * A Component to override default layer for a component.
 * This way an arbitrary mesh of an entity can be rendered or ignored for a certain camera.
 *
 * {@link THREE.Layers}
 *
 * e.g. camera-layers="active:Log" - Will enable all meshes for the entity to only show up when the camera is showing log information (camera layer Log is enabled too)
 *
 */
import {querySelectorAll} from '../utils/selector-utils';
import {setLayersForObject, Layers} from '../types/Layers';
import * as _ from 'lodash';

AFRAME.registerComponent('camera-layers', {

  schema: {
    meshSelector: {type: 'string', default: ':Mesh:where(geometry)'},
    active: { type: 'array', default: 'Default'}
  },
  // Called once when the component is initialized.
  // Used to set up initial state and instantiate variables.
  init () {

  },

  // Called both when the component is initialized and whenever the component’s
  // data changes (e.g, via setAttribute). Used to modify the entity.
  update () {
    // TODO find an alternative to select relevant child element
    console.warn('camera-layers works recursive and will set layers of all descendants');
    var meshes = querySelectorAll(this.el.object3D, this.data.meshSelector);
    console.log('found meshes', meshes);
    var _layers = _.map(this.data.active, function (strValue) {
      var id = parseInt(strValue);
      var layer;
      if (isNaN(id)) { layer = Layers.enumValueOf(strValue); } else { layer = Layers.enumValueOfOrdinal(id); }
      return layer;
    });

    _layers = _.reject(_layers, _.isUndefined);

    _.each(meshes, mesh => setLayersForObject(mesh, ..._layers));
  },

  // Called when the component detaches from the element (e.g.,
  // via removeAttribute). Used to undo all previous modifications to the entity.
  remove () {
  },

  // Called on each render loop or tick of the scene. Used for continuous changes.
  tick () {
  },

  // Called whenever the scene or entity plays to add
  // any background or dynamic behavior. Used to start or resume behavior.
  play () {
  },

  // Called whenever the scene or entity pauses to remove any
  // background or dynamic behavior. Used to pause behavior.
  pause () {
  },

  // Called on every update. Can be used to dynamically modify the schema.
  updateSchema () {
  }
});
