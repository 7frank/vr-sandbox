import _ from 'lodash';
/**
 * Simple color select with accent colors.
 * Note: default selection of color is triggered by action: "interaction-pick" not click event
 */

AFRAME.registerComponent('gui-color-list', {
  schema: {
    caption: {type: 'string', default: 'color-select'}
  },

  tick: function () {
    // this.el.object3D.rotation.setFromRotationMatrix(document.querySelector('[camera]').object3D.matrix);
    this.el.object3D.setRotationFromQuaternion(document.querySelector('[camera]').object3D.quaternion);
  },
  init: function () {
    var accents = {
      'Magenta': '255,0,151',
      'Purple': '162,0,255',
      'Teal': '0,171,169',
      'Lime': '140,191,38',
      'Brown': '160,80,0',
      'Pink': '230,113,184',
      'Orange': '240,150,9',
      'Blue': '27,161,226',
      'Red': '229,20,0',
      'Green': '51,153,51'

    };

    var colorButtons = _(accents)
      .map((v, k) => ` <a-gui-button  width="2" height="0.5" gui-button="backgroundColor:rgb(${v})" value="${k}"></a-gui-button>`)
      .value()
      .join('');

    this.el.innerHTML = `

   
  <a-gui-flex-container 
        align-items="normal"
        flex-direction="column"
        component-padding="0.1"
        opacity="0"
        width="2"      
   
>

            <a-gui-label  width="2" height="0.5" value="${this.data.caption}"></a-gui-label>
            ${colorButtons}


   </a-gui-flex-container>
                


`;

    // -----------------------------------------

    var colorButtons = this.el.querySelectorAll('a-gui-button').toArray();

    colorButtons.forEach((btn) => btn.addEventListener('interaction-pick', e => {
      var selectedColor = btn.getAttribute('gui-button').backgroundColor;

      e.stopPropagation();
      this.el.emit('change', {color: selectedColor});
    }));
  }

});
