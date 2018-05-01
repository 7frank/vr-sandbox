
// those are currently bound to document/window
// what changes need to be made to bind it to the player directly but still maintain usability

AFRAME.registerComponent('hotkey-controls', {
  schema: { activeCategories: {type: 'array', default: ['*']}
  },
  init: function () {

    //  var CustomComponents = require('@nk11/core-components/dist/bundle');
    // var  Hotkeys = CustomComponents.Hotkeys;

    //   Hotkeys.enableCategorys(this.data.activeCategories)

  },
  update: function () {

  }

});
