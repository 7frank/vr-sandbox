import DialogComponent from '../DialogComponent';
import '../DialogComponent.css';
import template from './OptionsDialog.html';
import $ from 'jquery';

import _ from 'lodash';

export default class OptionsDialog {
  constructor () {
    var dlg = new DialogComponent();
    dlg.setCaption('Options Dialog');
    this.$ = dlg.$;
    dlg.setBody(template);

    this.fillCheckboxes(dlg, $('.player').get(0));

    // loads the Icon plugin
  }

  fillCheckboxes (dialog, targetElement) {
    var dataTemplate = `  wasd-controls
      look-controls
      -vendor-
      daydream-controls
      gearvr-controls
      oculus-touch-controls
      vive-controls
      windows-motion-controls
      -util-
      hand-controls
      laser-controls
      tracked-controls
      -aframe-extras-
      universal-controls| Replacement for wasd and look controls also has touch support on mobile.
      checkpoint-controls|Teleport or animate between checkpoints. See also: checkpoint. Fires navigation-start and navigation-end events.
          gamepad-controls|Gamepad position + (optional) rotation controls.
          hmd-controls|HMD rotation / positional tracking controls.
          keyboard-controls|WASD+Arrow key movement controls, with improved support for ZQSD and Dvorak layouts.
          mouse-controls|Mouse + Pointerlock controls. Non-VR / desktop only.
          touch-controls|Touch-to-move controls, e.g. for Cardboard.
`;

    var lines = dataTemplate.split('\n');
    lines = lines.map(_.trim);
    var entries = lines.map((v) => v.split('|'));
    var elements = _.map(entries, function (entry) {
      var key = entry[0];

      var $row = $('<label>');
      var isHeader = key[0] == '-';
      if (isHeader) {
        var elem = $('<div class="strike">');
        elem.append($('<span>').append(key.replace(new RegExp('-', 'g'), '')));

        $row.append($('<b>').append(elem));
      } else {
        var inputElement = $("<input type='checkbox'' />");

        inputElement.on('change', function () {
          var checked = $(this).is(':checked');

          if (checked) {
            targetElement.setAttribute(key, '');
          } else targetElement.removeAttribute(key);
        });

        if (targetElement && targetElement.hasAttribute(key)) {
          inputElement.attr('checked', true);
        }

        $row.append(inputElement, $('<b>').append(key));

        if (entry.length > 1) {
          $row.append($('<span>').append(entry[1]));
        }
      }

      return $row;
    });
    dialog.$.find('#checkboxes').html(elements);

    //   <label><input type="checkbox" />-default-</label>
  }
}
