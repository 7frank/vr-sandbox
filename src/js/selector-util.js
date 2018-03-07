import {CssSelectorParser} from 'css-selector-parser';
import * as _ from 'lodash';
import {createNamespace, namespaceExists, namespaceInfo} from './namespace';

/**
 *  Creates the option to query for parts of the three-js scene graph.
 *  Note: Nesting is only partially supported.
 *
 *  TODO have a factory method than extends any object to be used by querySelectorAll
 *  TODO have broader nesting support
 *  TODO have attribute equality comparators other than "equal"
 *
 *  See {@link https://github.com/mdevils/node-css-selector-parser} for details of the parser.
 *
 *  @example
 *  //find all cameras that are currently invisible
 *  querySelectorAll(".PerspectiveCamera[visible=false]")
 *
 *  @example
 *  //find all meshes whose bounding spheres have a smaller radius than 1 (this is working by having non-standard pseudo element 'get' which is parsed in a different manner)
 *  querySelectorAll(".Mesh:where(geometry-boundingSphere-radius<1)")
 *
 *  @example
 *  //query for elements whose name property is wireframe
 *  querySelectorAll("[name='wireframe']")
 *
 *  @param {THREE.Object3D} object3D - An object of the scene graph that will be the root.
 *  @param {selector} selector - A css selector.
 *  @returns {THREE.Object3D[]}
 */

export function querySelectorAll (object3D, selector, debug = false) {
  if (typeof object3D != 'object') throw new Error('first param must be a THREE.Obect3D');
  if (typeof selector != 'string') throw new Error('second param must be a proper css-selector string');
  if (selector == '') selector = 'selector';
  // convenience function allowing for simply dropping AFRAME elements
  if (typeof object3D.object3D == 'object') { object3D = object3D.object3D; }

  // Note: the parser removes singleQuotes and breaks some stuff this way
  // that's why we have to replace them
  selector = selector.replace(new RegExp("'", 'g'), '`');

  var entry = parseCSSSelector(selector);

  if (debug) {
    console.group('threejs querySelectorAll');
    console.log('parsed', entry);
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
     * @param {any|undefined} value - The value to test for equality.  Note: if value==undefined then it only test for the key to exist with any value
     * @returns {THREE.Object3D[]}
     */

  function getObjectsByAttr (object3D, attrName, value) {
    if (debug) {
      console.log('getObjectsByAttr', attrName, value);
    }
    if (!attrName) throw new Error('attrName must be defined');

    var result = [];
    object3D.traverse(function (object) {
      if (object[attrName]) {
        if (value == undefined || object[attrName] == value) { // undefined in this context means that any value is valid
          result.push(object);
        }
      }
    });
    return result;
  }

  /**
     * Parses a string containing <key> <operator> <value> of a partial  css-selector  ":where(<key> <operator> <value>)" into its parts
     * Note: In case no operator was defined it will return a fallback object that should work like an '*' or 'any'- selector.
     * @param valueString
     */
  function parseWherePseudoCSSProperty (valueString) {
    var operators = '<=,==,>=,!=,<,=,>'.split(',');

    var test = operators.map(function (op) {
      var tmp = valueString.split(op);

      if (tmp.length == 2) {
        if (op == '=') op = '=='; // replace "=" from css notation which is for assigning stuff in js

        return {key: tmp[0], operator: op, value: tmp[1]};
      }
    });

    var item = _.find(test, function (o) {
      return typeof o == 'object';
    });
    if (item) {
      return item;
    } else {
      return {key: valueString, operator: '', value: undefined};
    }
  }

  /**
     * If the array contains elements those get 'and' connected with following partial css selectors.
     * @param {THREE.Object3D[]} arr - The array of partial results that gets mutated.
     * @param {THREE.Object3D} object3D - The Parent element.
     * @param {string} key - An attribute key of  the 'object3D' param.
     * @param {*} value - A value to compare to.
     */
  function filterOrPush (arr, object3D, key, value) {
    if (arr.length > 0) {
      if (debug) {
        console.log('filtering', key, value);
      }

      for (let i = 0; i < arr.length; i++) {
        let curr = arr[i];
        // discard if key does not exist but value would accept any eg. css('[visibl]')
        if ((curr[key] == undefined || curr[key] == null) && value == undefined) {
          arr.splice(i, 1);
          i--;
        } else
        // discard if key does exist but value isn't equal on the condition that value isn't undefined in which case any value is ok  eg. css('[visible]') or  eg. css('[visible=true]')
        if (curr[key] != value && value != undefined) {
          arr.splice(i, 1);
          i--;
        }
      }
    } else arr.push(...getObjectsByAttr(object3D, key, value));
  }

  /**
     *
     * A custom quick fix for the where pseudo attribute of filterOrPush.
     *
     *  TODO refactor .. bad practice
     *
     * @param arr
     * @param object3D
     * @param filterNamespaceExists
     */

  function filterOrPushCustom (arr, object3D, filterNamespaceExists) {
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr[i];
        if (!filterNamespaceExists(curr)) {
          arr.splice(i, 1);
          i--;
        }
      }
    } else arr.push(...getObjectsByFilter(object3D, filterNamespaceExists));
  }

  /**
     * Handles a ruleSet-rule of the css-selector-parser object.
     *
     * @param rule - A rule as it is returned by {@link CssSelectorParser}
     * @returns {Array}
     */
  function handleRule (rule, object3D) {
    var result = [];
    if (debug) {
      console.log('handle rule', rule);
    }

    // handle id parts like '#myId'
    if (rule.id) {
      filterOrPush(result, object3D, 'id', rule.id);
      if (result.length == 0) return [];// we did not find anything and may return
    }

    // we dont have a tag name but we do have "classes" so we'll take those instead
    if (rule.tagName) {
      // the all operator "*" gets translated
      // at least in threejs every element has at least an empty children array for this case
      if (rule.tagName == '*') { filterOrPush(result, object3D, 'children', undefined); } else { filterOrPush(result, object3D, 'type', rule.tagName); }

      if (result.length == 0) return [];// we did not find anything and may return
    }
    // the same applies to class names which also get resolved to the class >> instance.type attribute
    if (rule.classNames) {
      _.each(rule.classNames, (className) => filterOrPush(result, object3D, 'type', className));
      if (result.length == 0) return [];// we did not find anything and may return
    }
    // handle attribute selector like  "[title='hello']"
    if (rule.attrs) {
      _.each(rule.attrs, function (attr) {
        if (attr.operator != '=' && attr.operator != undefined) console.warn("attribute clause only supports '=' - Operator: " + attr.operator);

        // parse or undefined which will be the same as * or all entries that contain the key itself
        // let mVal = attr.value ? JSON.parse(attr.value) : undefined;
        let mVal = attr.value ? eval(attr.value) : undefined; // eslint-disable-line no-eval
        filterOrPush(result, object3D, attr.name, mVal);
      });
      if (result.length == 0) return [];// we did not find anything and may return
    }

    // Handle css pseudo classes. Only ':where(...)' is implemented.
    if (rule.pseudos) {
      _.each(rule.pseudos, function (pseudo) {
        if (pseudo.name != 'where') {
          console.warn("only supports ':where'-pseudo");
          return;
        }
        var whereObject = parseWherePseudoCSSProperty(pseudo.value);
        if (debug) {
          console.log('whereObject', whereObject);
        }
        var namespaceString = whereObject.key.replace(new RegExp('-', 'g'), '.');
        var info = namespaceInfo(namespaceString);

        function filterNamespaceExists (object3D) {
          if (!namespaceExists(info.root, object3D)) {
            return false;
          }

          var namespace = createNamespace(info.root, object3D);

          var type = typeof namespace[info.key];

          // handle edge case: no operator
          // Note: if type == function then we could discard it but there is no need and checking for meshes who have specific mixin functions available might be useful idk.
          if (whereObject.operator == '') {
            return namespace[info.key] != undefined && namespace[info.key] != null;
          } else if (type == 'object') {
            if (whereObject.value != 'null') {
              console.warn(':where object comparison can only be made with value null eg. :where(mObj==null)');
              return false;
            }

            // handle explicit comparisons with  '!='  '==' or  '=' to null
            if (whereObject.operator == '=') return namespace[info.key] == null;
            if (whereObject.operator == '==') return namespace[info.key] == null;
            if (whereObject.operator == '!=') return namespace[info.key] != null;
          } else { // eval.. for lack of other reasonable options
            let leftSide = namespace[info.key];
            let rightSide = whereObject.value;
            if (typeof leftSide == 'string') {
              if (leftSide == '') leftSide = '``';
              else {
                leftSide = '`' + encodeURI(leftSide) + '`';
                // TODO "" encoded to `%60%60` somewhere which might or might not become a problem
                if (typeof rightSide == 'string') { rightSide = '`' + encodeURI(rightSide) + '`'; }
              }
            }

            let toEval = leftSide + whereObject.operator + rightSide;
            if (debug) console.log(toEval);
            return eval(toEval);// eslint-disable-line no-eval
          }
        }

        filterOrPushCustom(result, object3D, function (object3D) {
          return filterNamespaceExists(object3D);
        });
      });
      if (result.length == 0) return [];// we did not find anything and may return
    }

    if (rule.rule) {
      // TODO nesting operators other than null == traverse all descendant elements
      // > children only
      // + sibling immediately following
      // ~ general sibling meaning same parent
      var mRes = [];
      _.each(result, function (object3D) {
        if (debug) console.group('nesting', rule.nestingOperator);
        mRes = _.union(mRes, handleRule(rule.rule, object3D));
        if (debug) console.groupEnd();
      });
      result = mRes;
    }

    return result;
  }

  var allResults = [];

  switch (entry.type) {
    case 'selectors':
      _.each(entry.selectors, function (selector) {
        if (selector.rule.nestingOperator != null) { console.warn("nesting only supports '=' operator. Not supported: " + selector.rule.nestingOperator); }

        if (debug) {
          console.log('handling - selectors');
        }
        // allResults.push(...querySelectorAll(object3D, selector));
        allResults = _.union(allResults, handleRule(selector.rule, object3D));
      });
      break;
    case 'ruleSet':
      if (debug) {
        console.log('handling - ruleSet');
      }
      allResults.push(...handleRule(entry.rule, object3D));
      break;
    default:
      console.warn('SceneGraphCSS - unsupported type:', entry.type);
  }
  if (debug) {
    console.groupEnd();
  }

  return allResults;
}

/**
 * Parses a css selector.
 *
 * @param {selector} selector- The selector.
 */

export function parseCSSSelector (selector) {
  var parser = new CssSelectorParser();

  parser.registerSelectorPseudos('has');
  parser.registerNestingOperators('>', '+', '~', ' ');
  parser.registerAttrEqualityMods('^', '$', '*', '~');
  parser.enableSubstitutes();

  // console.log(inspect(parser.parse('a[href^=/], .container:has(nav) > a[href]:lt($var)'), false, null));
  var parsed = parser.parse(selector);
  // console.log(inspect(parsed, false, null));
  return parsed;
}

/**
 * Filter elements.
 *
 *
 * @param {THREE.Object3D} object3D - The parent element.
 * @param {function} filterFunction - A custom filter function.
 * @returns {Array}
 */
function getObjectsByFilter (object3D, filterFunction) {
  var result = [];
  object3D.traverse(function (object) {
    if (filterFunction(object)) result.push(object);
  });
  return result;
}
