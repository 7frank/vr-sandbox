/**
 * put in front of a component you want to debug live like with webpack  or so
 *
 * removes old component stores existing instances and recreates tehm after the new version is loaded
 * TODO this does not work all the time
 */
export
function updateHotComponent (componentName) {
  if (AFRAME.components[componentName]) {
    delete AFRAME.components['cdlod-terrain'];
    console.warn('.................overwriting previous ' + componentName + ' version');
    var oldInstances = document.querySelectorAll('[' + componentName + ']');

    var tmp = [];
    oldInstances.forEach(function (el) {
      var value = el.getAttribute(componentName);

      tmp.push({el, value});
      el.removeAttribute(componentName);
    });
    setTimeout(function () {
      tmp.forEach(function (entry) {
        entry.el.setAttribute(componentName, entry.value);
      });
    }, 1);
  } else console.warn('.................registering component ' + componentName + ' as hot. this might mess with production code if not removed again');
}
