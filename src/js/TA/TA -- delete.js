
/***
 *      _______       
 *     |__   __|/\    
 *        | |  /  \   
 *        | | / /\ \  
 *        | |/ ____ \ 
 *        |_/_/    \_\
 *                    
 *                    

The Teaching Assistant (TA) is responsible for:
  * collecting data from the page and creating a tree of Targets (called a bullseye) representing the information
  * traverseing the bullseye and entering relevant data from Targets into a GradeBook.
*/

function TA() {
  this.target = null;
  this.gradebook = new GradeBook();
  this.operations = [];
  this.gradeOpposite = false;
  this.picky = false;
};

Object.defineProperties(TA.prototype, {
  count: {
    get: function() {
      this.runAgainstNextToBottomTargets(function (target) {
        return target.children.length;
      }, true);
      return this;
    }
  },
  not: {
    get: function () {
      this.gradeOpposite = true;
      return this;
    }
  },
  numberOfTargets: {
    get: function () {
      return this.targetIds.length;
    }
  },
  onlyOneOf: {
    get: function () {
      this.picky = 'onlyOneOf';
      return this;
    }
  },
  pageImageBytes: {
    get: function () {
      // TODO
    }
  },
  someOf: {
    get: function () {
      this.picky = 'someOf';
      return this;
    }
  },
  targetIds: {
    get: function () {
      var ids = [];
      this.traverseTargets(function (target) {
        ids.push(target.id);
      });
      return ids;
    }
  },
  toExist: {
    get: function() {
      this.testingExistence = true;
      var operations = this.operations || [];
      
      var doesExist = false;
      
      // typeof null === "object", for some insane reason. This is to correct for it.
      if (operations === null) {
        operations = false;
      }
      var typeOfOperation = typeof operations;
      if (typeOfOperation === "object" && operations instanceof Array) {
        typeOfOperation = "array";
      }

      if (typeOfOperation !== "array") {
        this.operations = [operations]
      }

      var doesExistFunc = function () {};
      var subDoesExist = false;

      switch (typeOfOperation) {
        case "number":
          doesExistFunc = function (x) {
            var subDoesExist = false;
            if (x > 0) {
              subDoesExist = true;
            }
          }
          break;
        case "string":
          doesExistFunc = function (x) {
            var subDoesExist = false;
            if (x.length > 0) {
              subDoesExist = true;
            }
          }
          break;
        case "array":
          doesExistFunc = function (x) {
            if (x) {
              return true;
            } else {
              return false;
            }
          }
          break;
        case "object":
          doesExistFunc = function (x) {
            var subDoesExist = false;
            if (Object.keys(x).length > 0) {
              subDoesExist = true;
            }
          }
          break;
        case "function":
          doesExistFunc = function (x) {
            var subDoesExist = false;
            if (x.getBody().length > 0) {
              subDoesExist = true;
            }
          }
          break;
        default:
          // good for booleans or undefined
          doesExistFunc = function (x) {
            var subDoesExist = false;            
            if (x) {
              subDoesExist = true;
            }
          }
          break;
      }

      doesExist = this.grade(doesExistFunc);
      return this.wrapUpAndReturn(doesExist);
    }
  },
  UAString: {
    get: function () {
      this.operations = navigator.userAgent;
      this.documentValueSpecified = navigator.userAgent;
      return this;
    }
  },
  value: {
    get: function () {
      // TA returns a single value from the first Target hit with a value. Used to create vars in active_tests.
      var value = null;
      this.traverseTargets(function (target) {
        if (target.value) {
          value = target.value
        };
      });
      return value;
    }
  },
  values: {
    get: function () {
      // TA returns a flat array of values. Used to create vars in active_tests.
      var values = [];
      this.traverseTargets(function (target) {
        if (target.value) {
          values.push(target.value);
        };
      });
      return values;
    }
  }
})

/**
 * Let the TA know this just happened
 * @param  {string} operation - the thing that just happened
 */
TA.prototype.registerOperation = function (operation) {
  this.operations.push(operation);
  switch (operation) {
    case 'gatherElements':
      this.gradebook.reset();
  }
};

// TODO: use config to determine if all targets should be traversed or if it, for instance, breaks after the first value gets hit?
TA.prototype.traverseTargets = function (callback, lastNodeCallback, config) {
  // http://www.timlabonne.com/2013/07/tree-traversals-with-javascript/

  /**
   * Recursively dive into a tree structure from the top. Used on the Target structure here.
   * @param  {object} node - a target of bullseye. Start with the top.
   * @param  {function} func - function to run against each node
   * @param  {function} lastNodeCallback - will be called after the last function has run against the last node. Does not take a parameter! Should be bullseye independent.
   */
  function visitDfs (node, func, lastNodeCallback) {
    if (func) {
      func(node);
    }
 
    node.children.forEach(function (child, index, arr) {
      visitDfs(child, func);
    });
  };
  visitDfs(this.target, callback, lastNodeCallback);
};

/**
 * Run a function against the top-level Target in the bullseye
 * @param  {function} callback - the function to run against the top-level target
 * @param  {boolean} record - whether or not to record the target in the gradebook
 * @return {[type]}
 */
TA.prototype.runAgainstTopTargetOnly = function (callback, record) {
  var self = this;
  this.target.value = callback(this.target);
  if (record) {
    self.gradebook.recordQuestion({
      id: self.target.id,
      value: self.target.value
    });
  };
};
TA.prototype.runAgainstBottomTargets = function (callback, record) {
  var self = this;

  var allTargets = this.targetIds;

  this.traverseTargets(function (target) {
    if (!target.hasChildren && allTargets.indexOf(target.id) > -1) {
      target.value = callback(target);
      if (record) {
        self.gradebook.recordQuestion({
          id: target.id,
          value: target.value
        });
      };
    };
  });
};

TA.prototype.runAgainstBottomTargetElements = function (callback, record) {
  var self = this;

  var allTargets = this.targetIds;

  this.traverseTargets(function (target) {
    if (!target.hasChildren && allTargets.indexOf(target.id) > -1) {
      target.value = callback(target.element);
      if (record) {
        self.gradebook.recordQuestion({
          id: target.id,
          value: target.value
        });
      };
    };
  })
};

TA.prototype.runAgainstNextToBottomTargets = function (callback, record) {
  var self = this;

  this.traverseTargets(function (target) {
    // TODO: YEP! Definitely broken
    if (target.hasChildren && !target.hasGrandkids) {
      target.value = callback(target);
      if (record) {
        self.gradebook.recordQuestion({
          id: target.id,
          value: target.value
        })
      };
    };
  });
};

/**
 * Generates the top-level target. Matched elements end up as children targets. It will not have a element.
 * @param  {string} CSS selector - the selector of the elements you want to query
 * @return {object} this - the TA object
 */
TA.prototype.theseNodes = function (selector) {
  this.registerOperation('gatherElements');

  this.target = new Target();

  var self = this;

  getDomNodeArray(selector).forEach(function (elem, index, arr) {
    var target = new Target();
    target.element = elem;
    self.target.children.push(target);
  });

  return this;
}
TA.prototype.theseElements = TA.prototype.theseNodes;

/**
 * Will run a query against the lowest level targets in the Target tree
 * @param  {string} CSS selector - the selector of the children you want to query
 * @return {object} this - the TA object
 */
TA.prototype.deepChildren = function (selector) {
  this.registerOperation('gatherDeepChildElements');

  this.runAgainstBottomTargets(function (node) {
    getDomNodeArray(selector, node.element).forEach(function (newElem) {
      var childTarget = new Target();
      childTarget.element = newElem;
      node.children.push(childTarget);
    });
  });

  return this;
};
TA.prototype.children = TA.prototype.deepChildren;

// TODO: broken
TA.prototype.shallowChildren = function (selector) {
  var operation = 'gatherChildElements';
  this.operations = operation;

  var self = this;
  getDomNodeArray(selector, parent).forEach(function (elem, index, arr) {
    self.target.elements.push(elem);
  });
  return this;
};

TA.prototype.cssProperty = function (property) {
  this.registerOperation('cssProperty');

  this.runAgainstBottomTargetElements(function (elem) {
    var styles = getComputedStyle(elem);
    return styles[property];
  }, true);
  return this;
}

TA.prototype.attribute = function (attr) {
  this.registerOperation('attr')

  this.runAgainstBottomTargetElements(function (elem) {
    var attrValue = elem.getAttribute(attr);
    if (attrValue === '') {
      attrValue = true;
    }
    return attrValue;
  }, true);
  return this;
}

TA.prototype.absolutePosition = function (side) {
  this.registerOperation('absolutePosition');
  // http://stackoverflow.com/questions/2880957/detect-inline-block-type-of-a-dom-element
  function getDisplayType (element) {
    var cStyle = element.currentStyle || window.getComputedStyle(element, ""); 
    return cStyle.display;
  };

  var selectorFunc = function () {};
  switch (side) {
    case 'top':
      var selectorFunc = function (elem) {
        var displayType = getDisplayType(elem);
        var value = NaN;
        if (displayType === 'block') {
          value = elem.offsetTop;
        } else if (displayType === 'inline') {
          value = elem.getBoundingClientRect()[side];
        };
        return value;
      };
      break;
    case 'left':
      var selectorFunc = function (elem) {
        var displayType = getDisplayType(elem);
        var value = NaN;
        if (displayType === 'block') {
          value = elem.offsetLeft;
        } else if (displayType === 'inline') {
          value = elem.getBoundingClientRect()[side];
        };
        return value;
      };
      break;
    case 'bottom':
      var selectorFunc = function (elem) {
        var displayType = getDisplayType(elem);
        var value = NaN;
        if (displayType === 'block') {
          value = elem.offsetTop + elem.offsetHeight;
        } else if (displayType === 'inline') {
          value = elem.getBoundingClientRect()[side];
        };
        if (value === Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) {
          value = 'max';
        };
        return value;
      };
      break;
    case 'right':
      var selectorFunc = function (elem) {
        var displayType = getDisplayType(elem);
        var value = NaN;
        if (displayType === 'block') {
          value = elem.offsetLeft + elem.offsetWidth;
        } else if (displayType === 'inline') {
          value = elem.getBoundingClientRect()[side];
        };
        if (value === Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) {
          value = 'max';
        };
        return value;
      };
      break;
    default:
      selectorFunc = function () {
        console.log("You didn't pick a side for absolutePosition! Options are 'top', 'left', 'bottom' and 'right'.");
      };
      break;
  };

  this.runAgainstBottomTargetElements(function (elem) {
    return selectorFunc(elem);
  }, true);
  return this;
};



/*
  @param: expected* (any value)
  @param: noStrict/ (default: false)
*/
TA.prototype.toEqual = function(expected, noStrict) {
  noStrict = noStrict || false;
  
  var isEqual = false;
  var equalityFunc = function() {};
  switch (noStrict) {
    case true:
      equalityFunc = function(x) {
        return x == expected;
      };
      break;
    case false:
      equalityFunc = function(x) {
        return x === expected;
      };
      break;
    default:
      equalityFunc = function(x) {
        return x === expected;
      };
      break;
  }

  return this.gradebook.grade({
    callback: equalityFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })

  // isEqual = this.grade(equalityFunc, y);
  // return this.wrapUpAndReturn(isEqual);
}

TA.prototype.toBeGreaterThan = function(y, orEqualTo) {
  orEqualTo = orEqualTo || false;
  var isGreaterThan = false;

  var greaterThanFunc = function() {};
  switch (orEqualTo) {
    case true:
      greaterThanFunc = function (x, y) {
        var isGreaterThan = false;
        if (x >= y) {
          isGreaterThan = true;
        }
        return isGreaterThan;
      }
    case false:
      greaterThanFunc = function (x, y) {
        var isGreaterThan = false;
        if (x > y) {
          isGreaterThan = true;
        }
        return isGreaterThan;
      }
    default:
      greaterThanFunc = function (x, y) {
        var isGreaterThan = false;
        if (x > y) {
          isGreaterThan = true;
        }
        return isGreaterThan;
      }
  }

  isGreaterThan = this.grade(greaterThanFunc, y);
  return this.wrapUpAndReturn(isGreaterThan);
}

TA.prototype.toBeLessThan = function(y, orEqualTo) {
  orEqualTo = orEqualTo || false;
  var isLessThan = false; // TODO: delete?

  var lessThanFunc = function() {};
  switch (orEqualTo) {
    case true:
      lessThanFunc = function (x, y) {
        var isLessThan = false;
        if (x <= y) {
          isLessThan = true;
        }
        return isLessThan;
      }
    case false:
      lessThanFunc = function (x, y) {
        var isLessThan = false;
        if (x < y) {
          isLessThan = true;
        }
        return isLessThan;
      }
    default:
      lessThanFunc = function (x, y) {
        var isLessThan = false;
        if (x < y) {
          isLessThan = true;
        }
        return isLessThan;
      }
  }

  isLessThan = this.grade(lessThanFunc, y);
  return this.wrapUpAndReturn(isLessThan);
};

TA.prototype.toBeInRange = function(lower, upper, lowerInclusive, upperInclusive) {
  lowerInclusive = lowerInclusive || true;
  upperInclusive = upperInclusive || true;
  var isInRange = false;

  var xIsLessThan = function () {};
  switch (lowerInclusive) {
    case true:
      xIsLessThan = function (x, y) {
        var isInRange = false;
        if (x <= y) {
          isInRange = true;
        }
        return isInRange;
      }
    case false:
      xIsLessThan = function (x, y) {
        var isInRange = false;
        if (x < y) {
          isInRange = true;
        }
        return isInRange;
      }
    default:
      xIsLessThan = function (x, y) {
        var isInRange = false;
        if (x < y) {
          isInRange = true;
        }
        return isInRange;
      }
  }

  var xIsGreaterThan = function () {};
  switch (upperInclusive) {
    case true:
      xIsGreaterThan = function (x, y) {
        var isInRange = false;
        if (x >= y) {
          isInRange = true;
        }
        return isInRange;
      }
    case false:
      xIsGreaterThan = function (x, y) {
        var isInRange = false;
        if (x > y) {
          isInRange = true;
        }
        return isInRange;
      }
    default:
      xIsGreaterThan = function (x, y) {
        var isInRange = false;
        if (x > y) {
          isInRange = true;
        }
        return isInRange;
      }
  }

  var inRangeFunc = function (x, y) {
    var isInRange = false;
    x = x.replace('px', '');
    x = x.replace('%', '');
    if (xIsLessThan(x, range.upper) && xIsGreaterThan(x, range.lower)) {
      isInRange = true;
    }
    return isInRange;
  }

  var range = {upper: upper, lower: lower}; // this is a hack because genIsCorrect expects only one comparison value
  isInRange = this.grade(inRangeFunc, range);
  return this.wrapUpAndReturn(isInRange);
};

TA.prototype.toHaveSubstring = function (values, config) {
  // works on value if it's already there, otherwise it acts on innerHTML

  var self = this;
  config = config || {};
  this.needToIterate = true;
  // make sure values are an array
  if (!(values instanceof Array)) {
    values = [values];
  };
  var hasRightNumberOfSubstrings = false;

  var nInstances            = config.nInstances || false,   // TODO: not being used (Is there a good use case?)
      minInstances          = config.minInstances || 1,     // TODO: not being used
      maxInstances          = config.maxInstances || false, // TODO: not being used
      nValues               = config.nValues || false,
      minValues             = config.minValues || 1,
      maxValues             = config.maxValues || 'all';

  if (maxValues === 'all') {
    maxValues = values.length;
  };

  // TODO: refactor functionally?
  var substringFunc = function (targetedObj, values) {
    var string = '';
    if (targetedObj instanceof Node) {
      string = targetedObj.innerHTML;
    } else if (targetedObj.elem) {
      string = targetedObj.elem.innerHTML;
    } else {
      string = targetedObj;
    };
    var hasNumberOfValsExpected = false;
    var hits = 0;
    values.forEach(function(val, index, arr) {
      if (string.search(val) > -1) {
        hits+=1;
      };
    });

    if (nValues) {
      (hits === nValues) ? hasNumberOfValsExpected = true : hasNumberOfValsExpected = false;
    } else if (hits >= minValues && hits <= maxValues) {
      hasNumberOfValsExpected = true;
    };
    self.operations = [hasNumberOfValsExpected];
    return hasNumberOfValsExpected;
  };
  hasRightNumberOfSubstrings = this.grade(substringFunc, values);
  return this.wrapUpAndReturn(hasRightNumberOfSubstrings);
}