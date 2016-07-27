/**
 * @fileOverview This file contains helpers for the Grading Engine.
 * @name helpers.js<js>
 * @author Cameron Pittman
 * @license GPLv3
 */

// http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
function arrEquals(array1, array2) {
  if (!array1 || !array2) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (var i = 0, l = array1.length; i < l; i++) {
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      if (!array1[i].equals(array2[i])) {
        return false;
      }
    } else if (array1[i] != array2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

/**
 * Creates an Array of DOM nodes that match the selector
 * @param selector {string} CSS selector - selector to match against
 * @param  {DOM node} parent - parent for starting point
 * @return {array} Array of DOM nodes
 */
function getDomNodeArray(selector, parent) {
  if (!selector) {
    return [];
  }
  parent = parent || document;
  var nodes = Array.prototype.slice.apply(parent.querySelectorAll(selector));
  return nodes;
}

// modified from http://stackoverflow.com/questions/7960335/javascript-is-given-function-empty
Function.prototype.getBody = function() {
  // Get content between first { and last }
  var m = this.toString().match(/\{([\s\S]*)\}/m)[1];
  // strip whitespace http://stackoverflow.com/questions/14540094/javascript-regular-expression-for-removing-all-spaces-except-for-what-between-do
  m = m.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
    if ($1) {
      return $1.replace(/\s/g, '');
    } else {
      return $2;
    }
  });
  // Strip comments
  return m.replace(/^\s*\/\/.*$/mg, '');
};

// http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
// Use only if necessary...
function executeFunctionByName(functionName, context) {
  var args = [].slice.call(arguments).splice(2);
  var namespaces = functionName.split('.');
  var func = namespaces.pop();
  for (var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(this, args);
}

/**
 * Get the actual number from a measurement.
 * @param  {String} measurement - the measurement to strip
 * @return {Number} - the number inside
 */
function getUnitlessMeasurement(measurement) {
  if (typeof measurement === 'number') {
    return measurement;
  } else if (typeof measurement === 'string') {
    return measurement.match(/\d+/g)[0];
  } else {
    return NaN;
  }
}

// helper.js<js> ends here
