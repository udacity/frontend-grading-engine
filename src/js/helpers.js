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
      // Warning - two different object instances will never be equal:
      // {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

/**
 * Creates an Array of DOM nodes that match the selector.
 * @param {string} selector - The CSS selector to match against.
 * @param {HTMLElement} parent - The parent as starting point.
 * @return {HTMLCollection} Array of DOM nodes.

 */
function getDomNodeArray(selector, parent) {
  if (!selector) {
    return [];
  }
  parent = parent || document;
  var nodes = Array.prototype.slice.apply(parent.querySelectorAll(selector));
  return nodes;
}

// Modified from “Javascript : is given function empty?”:
// http://stackoverflow.com/q/7960335
Function.prototype.getBody = function() {
  // Get content between first { and last }
  var m = this.toString().match(/\{([\s\S]*)\}/m)[1];
  // “Javascript Regular Expression for Removing all Spaces except for
  // what between double quotes”:
  // http://stackoverflow.com/q/14540094/
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

// “How to execute a JavaScript function when I have its name as a
// string?”:
// http://stackoverflow.com/q/359788/
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
 * @param {String} measurement - The measurement to strip.
 * @return {Number} - The number inside.
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
