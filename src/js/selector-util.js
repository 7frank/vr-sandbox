import {CssSelectorParser} from 'css-selector-parser';
import inspect from 'util-inspect';
import {BoxHelperExt} from './three/BoxHelperExt';
import {FPSCtrl, stringifyWithPrecision} from './util';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import {createNamespace, namespaceExists, namespaceInfo} from './namespace';
import ZoomUtils from './utils/ZoomUtils';

var mesh2shape = require('three-to-cannon');

// if we really want to have a partially global object for debugging this should go into a separate file then..
AFRAME.nk = {querySelectorAll, ZoomUtils};
var debug = false;

/**
 *   Creates the option to query for parts of the three-js scene graph.
 *
 *   eg. selectors
 *   - find all cameras that are currently invisible
 *   ".PerspectiveCamera[visible=false]"
 *
 *   - find all meshes whose bounding spheres have a smaller radius than 1 (this is working by having non-standard pseudo element 'get' which is parsed in a different manner)
 *   ".Mesh:where(geometry-boundingSphere-radius<1)
 *   - query for elements whose name property is wireframe
 *    "[name='wireframe']"
 *
 * @param {THREE.Object3D} object3D - An object of the scene graph that will be the root.
 * @param {selector} selector - A css selector.
 * @returns {THREE.Object3D[]}
 */

export function querySelectorAll (object3D, selector, mDebug = false) {
  if (typeof object3D != 'object') throw new Error('first param must be a THREE.Obect3D');
  if (typeof selector != 'string') throw new Error('second param must be a proper css-selector string');

  // Note: the parser removes singleQuotes and breaks some stuff this way
  // thats why we have to replace them
  selector = selector.replace(new RegExp("'", 'g'), '`');

  var entry = parseCSSSelector(selector);

  if (mDebug)debug = mDebug;

  if (debug) {
    console.group('threejs querySelectorAll');
    console.log('parsed', entry);
  }

  /**
     * Fields for rule type.
     * @param rule
     tagName — tag name for the rule (e.g. "div"), may be '*'.
     classNames — list of CSS class names for the rule.
     attrs — list of attribute rules; rule may contain fields:
     name — attribute name, required field.
     valueType — type of comparison value ("string" or "substitute").
     operator — attribute value comparison operator.
     value — comparison attribute value.
     pseudos — list of pseudo class rules; rule may contain fields:
     name — pseudo name, required field.
     valueType — argument type ("string", "selector" or "substitute").
     value — pseudo argument.
     nestingOperator — the operator used to nest this rule (e.g. in selector "tag1 > tag2", tag2 will have nestingOperator=">")
     rule — nested rule.

     if result.length>0 result.filter by testing next partial rule for each result else use object3D

     */

  /**
     * Parses a string containing <key> <operator> <value> of a partial  css-selector  ":where(<key> <operator> <value>)" into its parts
     * Note: In case no operator was defined it will return a fallback object that should work like an '*' or 'any'- selector.
     * @param valueString
     */
  function parseWherePseudoCSSProperty (valueString) {
    var operators = '<,<=,=,>=,>,!=,=='.split(',');

    var test = operators.map(function (op) {
      var tmp = valueString.split(op);
      if (tmp.length == 2) {
        return {key: tmp[0], operator: op, value: tmp[1]};
      }
    });

    var item = _.find(test, function (o) {
      return typeof o == 'object';
    });
    if (item) { return item; } else { return {key: valueString, operator: '', value: ''}; }
  }

  /**
     * if the array contains elements those get 'and' connected with following partial css selectors
     * @param arr
     * @param object3D
     * @param key
     * @param value
     */
  function filterOrPush (arr, object3D, key, value) {
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr[i];
        if (!curr[key] == value) {
          arr.splice(i, 1);
          i--;
        }
      }
    } else arr.push(...getObjectsByAttr(object3D, key, value));
  }

  // TODO refactor .. bad practice for sure
  // a custom quick fix for the where pseudo attribute of filterOrPush
  function filterOrPushCustom (arr, object3D, filterNamespaceExists) {
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr[i];
        // let res = getObjectsByAttr(curr, key, value);
        // console.log('res', res);
        // if (!res.length) { arr.splice(i, 1); i--; }
        if (!filterNamespaceExists(curr)) {
          arr.splice(i, 1);
          i--;
        }
      }
    } else arr.push(...getObjectsByFilter(object3D, filterNamespaceExists));
  }

  /**
     * Handles a  ruleSet rule of the css-selector-parser object.
     * @param rule
     * @returns {Array}
     */
  function handleRule (rule) {
    var result = [];
    if (debug) { console.log('handle rule', rule); }
    // we dont have a tagname but we do have "classes" so we'll take those instead
    if (rule.tagName) {
      filterOrPush(result, object3D, 'type', rule.tagName);
    }
    // the same appliies to classnames which also get resolved to the class >> isntance.type attribute
    if (rule.classNames) {
      _.each(rule.classNames, (className) => filterOrPush(result, object3D, 'type', className));
    }
    //
    if (rule.attrs) {
      _.each(rule.attrs, function (attr) {
        if (attr.operator != '=') console.warn("only supports '=' operator");

        // parse or undefined which will be the same as * or all entries that contain the key itself
        // let mVal = attr.value ? JSON.parse(attr.value) : undefined;
        let mVal = attr.value ? eval(attr.value) : undefined; // eslint-disable-line no-eval
        filterOrPush(result, object3D, attr.name, mVal);
      });
    }
    if (rule.pseudos) {
      _.each(rule.pseudos, function (pseudo) {
        if (pseudo.name != 'where') {
          console.warn("only supports 'where'-pseudo");
          return;
        }
        var whereObject = parseWherePseudoCSSProperty(pseudo.value);
        if (debug) { console.log('whereObject', whereObject); }
        var namespaceString = whereObject.key.replace(new RegExp('-', 'g'), '.');
        var info = namespaceInfo(namespaceString);

        function filterNamespaceExists (object3D) {
          if (!namespaceExists(info.root, object3D)) {
            return false;
          }

          var namespace = createNamespace(info.root, object3D);

          // eval for lack of other reasonable options
          let toEval = namespace[info.key] + whereObject.operator + whereObject.value;
          return eval(toEval);// eslint-disable-line no-eval
        }

        filterOrPushCustom(result, object3D, function (object3D) {
          return filterNamespaceExists(object3D);
        });
      });
    }

    if (rule.nestingOperator) console.warn('nesting not supported');

    return result;
  }

  var allResults = [];

  switch (entry.type) {
    case 'selector':
      _.each(entry.selectors, function (selector) {
        if (debug) { console.log('handling - selector'); }
        allResults.push(...querySelectorAll(object3D, selector));
      });
      break;
    case 'ruleSet':
      if (debug) { console.log('handling - ruleSet'); }
      allResults.push(...handleRule(entry.rule));
      break;
    default:
      console.warn('SceneGraphCSS - unsupported type:', entry.type);
  }
  if (debug) { console.groupEnd(); }

  return allResults;
}

export function parseCSSSelector (selector) {
  var parser = new CssSelectorParser();

  parser.registerSelectorPseudos('has');
  parser.registerNestingOperators('>', '+', '~');
  parser.registerAttrEqualityMods('^', '$', '*', '~');
  parser.enableSubstitutes();

  // console.log(inspect(parser.parse('a[href^=/], .container:has(nav) > a[href]:lt($var)'), false, null));
  var parsed = parser.parse(selector);
  // console.log(inspect(parsed, false, null));
  return parsed;
}

export function addBoundingBox (obj) {
  var helper = new BoxHelperExt(obj);

  obj.parent.add(helper);

  var fc = new FPSCtrl(0.5, function (e) {
    // render each frame here
    helper.update(undefined, obj.parent, true, false);
  });
  fc.start();
  return helper;
}

/**
 * returns all child nodes of the element that contain a property geometry which should always be a mesh
 * @param {HTMLElement} el
 * @returns {THREE.Mesh[]}
 */
function getMeshes (el) {
  // noinspection JSValidateTypes
  return getObjectsByAttr(el.object3D, 'geometry');
}

/**
 * Returns all child nodes of the element that contain a property "attrName"
 *  examples: css selector        -- query
 *            .PerspectiveCamera  -- attrName="type" value="PerspectiveCamera"
 *            #test               -- attrName="id" value="test"
 *            [visible=true]      -- attrName="visible" value=true
 *
 * @param {HTMLElement} el
 * @param attrName - a property key of el.object3D
 * @param value - the value to test for equality
 * @returns {THREE.Object3D[]}
 */

function getObjectsByAttr (object3D, attrName, value) {
  if (debug) { console.log('getObjectsByAttr', attrName, value); }
  if (!attrName) throw new Error('attrName must be defined');

  var result = [];
  object3D.traverse(function (object) {
    if (object[attrName]) {
      if (value == undefined || object[attrName] == value) {
        result.push(object);
      }
    }
  });
  return result;
}

/**
 *
 * @param object3D
 * @param attrName
 * @param value
 * @returns {Array}
 */
function getObjectsByFilter (object3D, filterFunction) {
  var result = [];
  object3D.traverse(function (object) {
    if (filterFunction(object)) result.push(object);
  });
  return result;
}

/**
 * goal find children of model and for example attach bounding boxes for physics
 *
 *
 * @param selector
 * @returns {*|jQuery|HTMLElement}
 */

export function testCompoundGLTF (modelEl, debug = false) {
//    modelEl=jQuery("[gltf-model]")[3];
  // var items=modelEl.object3D.children[0].children[0].children[0].children[0].children
  var items = getMeshes(modelEl);
  items.shift();
  if (debug) {
    console.group('cannon-compound:testCompoundGLTF');
  }

  function localToObject (vector, object3D) {
    return vector.applyMatrix4(object3D.matrix);
  }
  var i = 0;
  items.forEach(el => {
    if (el.geometry) el.geometry.computeBoundingBox();

    var bb = el.geometry.boundingBox;
    var vCenter = bb.getCenter();
    var size = bb.getSize();

    console.log(el.name, 'size', size.length());
    // TODO don't ignore big stuff anymore
    if (size.length() >= 20) {
      // if (i++ >= 20) {
      el.visible = false;

      return;
    } // TODO only use first few elements for testing

    // FIXME the physics are one global system so we need our bodys to be relative to the world for now
    // but later on we probably will need different independent worlds
    var region = modelEl.parentEl;
    //  var regionPosition = modelEl.object3D.position.clone().applyMatrix4(region.object3D.matrix);

    // var vPosition = regionPosition.add(vCenter);
    //  console.log(el.matrixWorld);
    // var vPosition = el.localToWorld(el.position.clone());
    // var vPosition = el.position.clone().applyMatrix4(region.object3D.matrix).add(vCenter);

    // TODO shouldn't the center be applied Oo?
    var vPosition = el.getWorldPosition();// .applyMatrix4(region.object3D.matrix)
    // .add(vCenter);

    var vScale = el.getWorldScale();
    var vQuaternion = el.getWorldQuaternion();

    var testMult = 1;
    size.x *= vScale.x * testMult;
    size.y *= vScale.y * testMult;
    size.z *= vScale.z * testMult;

    //    var vPosition = el.position.clone().add(vCenter);
    // var vPosition = el.position.clone().add(vCenter);

    // FIXME position is not correct
    //    vPosition = localToObject(vPosition, modelEl.object3D);
    // vPosition = localToObject(vCenter, modelEl.object3D);

    /* // ---------------------------------------

    var shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));

    var cannonPos = new CANNON.Vec3(vPosition.x, vPosition.y, vPosition.z);

    modelEl.body.addShape(shape, cannonPos);
*/
    // ---------------------------------------
    /*
     var boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    var boxBody = new CANNON.Body({ mass: 000 });
    boxBody.addShape(boxShape);
    boxBody.position.set(vPosition.x, vPosition.y, vPosition.z);
    modelEl.body.world.addBody(boxBody);
*/
    // ---------------------------------------
    /* var geometry = new THREE.BoxGeometry(size.x / 2, size.y / 2, size.z / 2);
    var material = new THREE.MeshBasicMaterial({color: 0x0000ff});
    var cube = new THREE.Mesh(geometry, material);
    cube.position.copy(vPosition);
    modelEl.sceneEl.object3D.add(cube);
*/
    // ---------------------------------------

    // ok so far the closest to something working ...
    // el=jQuery("#physicsTestRegion").find("[gltf-model]")[0]
    var boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    var boxBody = new CANNON.Body({ mass: 0 });
    boxBody.addShape(boxShape);
    boxBody.position.set(vPosition.x, vPosition.y, vPosition.z);
    boxBody.quaternion.set(vQuaternion.x, vQuaternion.y, vQuaternion.z, vQuaternion.w);

    modelEl.body.world.addBody(boxBody); var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    var material = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true});
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(vPosition.x, vPosition.y, vPosition.z);

    cube.quaternion.set(vQuaternion.x, vQuaternion.y, vQuaternion.z, vQuaternion.w);

    modelEl.sceneEl.object3D.add(cube);

    // TODO the rotatiom is wrong
    // el=jQuery("#physicsTestRegion").find("[gltf-model]")[0];el.object3D.quaternion.x=0.7;

    // -------------------------------------------------
    if (debug) {
      // console.log(el);
      // console.log('position', stringifyWithPrecision(vPosition), 'size', stringifyWithPrecision(size));

      var helper = addBoundingBox(el);

      // TODO collision per sub-element not working
      boxBody.addEventListener('collide', _.debounce(function (e) {
        // console.log(modelEl, 'has collided with body ', e.detail.body);
        console.log('collision', e);
        e.body.el.setAttribute('color', _.sample('red', 'yellow', 'blue'));
        // console.log('collision', e);
        /*   e.detail.target.el;  // Original entity (playerEl).
            e.detail.body.el;    // Other entity, which playerEl touched.
            e.detail.contact;    // Stats about the collision (CANNON.ContactEquation).
            e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
       */
      }, 50));
    }
  });

  if (debug) {
    console.groupEnd();
  }
}

// Box shape
/*
var boxShape = new CANNON.Box(new CANNON.Vec3(size,size,size));
var boxBody = new CANNON.Body({ mass: mass });
boxBody.addShape(boxShape);
boxBody.position.set(-size*2,-size*2,size+1);
world.addBody(boxBody);

var shape = new CANNON.Box(new CANNON.Vec3(100,100,100));
el=jQuery("[gltf-model]")[3];el.body.addShape(shape);

*/

/**
 *
 * @param {{selector|Class[]|Class}} selector
 * @returns {*|jQuery|HTMLElement}
 */
/*
ThreeJS.prototype.find=function(selector)
{
    var self=this

    var res=$([])

    var selectorList=selector.split(",")
    if (selectorList.length>1)
    {
        var _arr=_.map(selectorList,function(selector){
            return self.find(selector).toArray()
        })

        res=$(  _.uniq(_.concat.apply(null,_arr)))
    }
    else
    {

        if(selector=="*") selector=".THREE.Object3D"

        if(selector[0]=="#") res= this.getByName(selector.substring(1))

        if(selector[0]=="."){
            var ns=selector.substring(1)
            if (nk.namespaceExists(ns))
                res= this.getByType(nk.namespace(ns))
        }

    }

    res.setAll=function(valuesAsObject)
    {
        this.each(function(k,entry){ _.assign(entry,valuesAsObject) })
        return this
    }

    res.getAll=function(valuesAsArray)
    {
        var result=[]

        this.each(function(k,entry){ result.push(_.get(entry,valuesAsArray)) })
        return result
    }

    return res
}

*/
