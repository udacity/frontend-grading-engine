
Object.defineProperties(TA.prototype, {
  count: {
    get: function() {
      this.runAgainstNextToBottomTargets(function (target) {
        return target.children.length;
      }, true);
      return this;
    }
  },
  toExist: {
    get: function() {
      // typeof null === "object", for some insane reason. This is to correct for it.
      // if (operations === null) {
      //   operations = false;
      // }
      // var typeOfOperation = typeof operations;
      // if (typeOfOperation === "object" && operations instanceof Array) {
      //   typeOfOperation = "array";
      // }

      // if (typeOfOperation !== "array") {
      //   this.operations = [operations]
      // }

      var typeOfOperation = this.operations[this.operations.length - 1];

      var self = this;
      var doesExistFunc = function () {};
      switch (typeOfOperation) {
        case 'gatherElements':
          doesExistFunc = function (topTarget) {
            return topTarget.children.length > 0;
          };
          break;
        case 'gatherDeepChildElements':
          doesExistFunc = function (target) {
            var hasElement = false;
            if (target.element) {
              hasElement = true;
            }
            return hasElement;
          };
          break;
        default:
          doesExistFunc = function (target) {
            var doesExist = false;
            if (target.value) {
              doesExist = true;
            }
            return doesExist
          }
          break;
      }

      return this.gradebook.grade({
        callback: doesExistFunc,
        not: this.gradeOpposite,
        strictness: this.picky
      })
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

/*
  @param: expected* (any value)
  @param: noStrict/ (default: false)
*/
TA.prototype.toEqual = function (expected, noStrict) {
  noStrict = noStrict || false;
  
  var isEqual = false;
  var equalityFunc = function() {};
  switch (noStrict) {
    case true:
      equalityFunc = function (target) {
        return target.value == expected;
      };
      break;
    case false:
      equalityFunc = function (target) {
        return target.value === expected;
      };
      break;
    default:
      equalityFunc = function (target) {
        return target.value === expected;
      };
      break;
  }

  return this.gradebook.grade({
    callback: equalityFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
}

TA.prototype.toBeGreaterThan = function (expected, orEqualTo) {
  orEqualTo = orEqualTo || false;
  var isGreaterThan = false;

  var greaterThanFunc = function() {};
  switch (orEqualTo) {
    case true:
      greaterThanFunc = function (target) {
        var isGreaterThan = false;
        if (target.value >= expected) {
          isGreaterThan = true;
        }
        return isGreaterThan;
      }
    case false:
      greaterThanFunc = function (target) {
        var isGreaterThan = false;
        if (target.value > expected) {
          isGreaterThan = true;
        }
        return isGreaterThan;
      }
    default:
      greaterThanFunc = function (target) {
        var isGreaterThan = false;
        if (target.value > expected) {
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