
// TODO copy on/off behaviour from other project and use before-render

export default function RenderMixin (obj3d) {
  if (!(obj3d instanceof THREE.Object3D)) throw new Error('must be THREE.Object3D');

  Reflect.defineProperty(obj3d, 'on', {
    enumerable: false,
    configurable: false,
    get: function () {
      return function () { };
    },
    set: function (newOpacity) {
      console.warn("can't override 'on'");
    }

  });

  function onBeforeRender () {

  }

  Reflect.defineProperty(obj3d, 'onBeforeRender', {
    enumerable: false,
    configurable: false,
    get: function () {
      return onBeforeRender;
    },
    set: function (fn) {
      console.warn("use el.on('before-render',callbackfn) instead");

        obj3d.el.addEventListener('before-render')

    }

  });

  return obj3d;
}
