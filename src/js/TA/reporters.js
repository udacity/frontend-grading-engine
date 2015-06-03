
/***
 *      _______                  _____                       _                
 *     |__   __|/\              |  __ \                     | |               
 *        | |  /  \     ______  | |__) |___ _ __   ___  _ __| |_ ___ _ __ ___ 
 *        | | / /\ \   |______| |  _  // _ \ '_ \ / _ \| '__| __/ _ \ '__/ __|
 *        | |/ ____ \           | | \ \  __/ |_) | (_) | |  | ||  __/ |  \__ \
 *        |_/_/    \_\          |_|  \_\___| .__/ \___/|_|   \__\___|_|  |___/
 *                                         | |                                
 *                                         |_|                                
 
Reporters live on the TA and are responsible for:
  * giving the GradeBook instructions for evaluating the questions it has collected.
  * instantiating the grading process by calling gradebook.grade()

 */

Object.defineProperties(TA.prototype, {
  toExist: {
    /**
     * Checks that either values or elements exist on questions in GradeBook.
     * @return {object} result - the GradeBook's list of questions and overall correctness.
     */
    get: function() {
      var typeOfOperation = this.operations[this.operations.length - 1];

      var self = this;
      var doesExistFunc = function () {};
      switch (typeOfOperation) {
        case 'gatherElements':
          doesExistFunc = function (topTarget) {
            console.log('hi')
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
            if (target.value || target.element) {
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
    /**
     * Use for debug purposes only. Returns the first value found on the bullseye.
     * @return {*} value - the value retrieved.
     */
    get: function () {
      // TA returns a single value from the first Target hit with a value. Used to create vars in active_tests.
      var value = null;
      this.runAgainstBottomTargets(function (target) {
        if (target.value) {
          value = target.value
        };
        return target.value;
      });
      return value;
    }
  },
  values: {
    /**
     * Use for debug purposes only. Returns all values found on the bullseye.
     * @return {[]} values - all the values retrieved.
     */
    get: function () {
      // TA returns a flat array of values. Used to create vars in active_tests.
      var values = [];
      this.runAgainstBottomTargets(function (target) {
        if (target.value) {
          values.push(target.value);
        };
        return target.value;
      });
      return values;
    }
  }
})

/**
 * Check that question values match an expected value.
 * @param  {*} expected - any value to match against, but typically a string or int.
 * @param  {boolean} noStrict - check will run as === unless noStrict is true.
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.toEqual = function (expected, noStrict) {
  noStrict = noStrict || false;
  
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

/**
 * Check that the target value is greater than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as >= instead of >
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.toBeGreaterThan = function (expected, orEqualTo) {
  orEqualTo = orEqualTo || false;

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

  return this.gradebook.grade({
    callback: greaterThanFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
}

/**
 * Check that the target value is less than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as <= instead of <
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.toBeLessThan = function(expected, orEqualTo) {
  orEqualTo = orEqualTo || false;

  var lessThanFunc = function() {};
  switch (orEqualTo) {
    case true:
      lessThanFunc = function (target) {
        var isLessThan = false;
        if (target.value <= expected) {
          isLessThan = true;
        }
        return isLessThan;
      }
    case false:
      lessThanFunc = function (target) {
        var isLessThan = false;
        if (target.value < expected) {
          isLessThan = true;
        }
        return isLessThan;
      }
    default:
      lessThanFunc = function (target) {
        var isLessThan = false;
        if (target.value < expected) {
          isLessThan = true;
        }
        return isLessThan;
      }
  }

  return this.gradebook.grade({
    callback: lessThanFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
};

/**
 * Check that the target value is between upper and lower.
 * @param  {Number} lower - the lower bounds of the comparison
 * @param  {Number} upper - the upper bounds of the comparison
 * @param  {Boolean} lowerInclusive - if true, run lower check as >= instead of >
 * @param  {Boolean} upperInclusive - if true, run upper check as <= instead of <
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.toBeInRange = function(lower, upper, lowerInclusive, upperInclusive) {
  lowerInclusive = lowerInclusive || true;
  upperInclusive = upperInclusive || true;

  // just in case someone screws up the order
  if (lower > upper) {
    var temp = lower;
    lower = upper;
    upper = temp;
  };

  var xIsLessThan = function () {};
  switch (upperInclusive) {
    case true:
      xIsLessThan = function (target) {
        var isInRange = false;
        if (target.value <= upper) {
          isInRange = true;
        }
        return isInRange;
      }
    case false:
      xIsLessThan = function (target) {
        var isInRange = false;
        if (target.value < upper) {
          isInRange = true;
        }
        return isInRange;
      }
    default:
      xIsLessThan = function (target) {
        var isInRange = false;
        if (target.value < upper) {
          isInRange = true;
        }
        return isInRange;
      }
  }

  var xIsGreaterThan = function () {};
  switch (lowerInclusive) {
    case true:
      xIsGreaterThan = function (target) {
        var isInRange = false;
        if (target.value >= lower) {
          isInRange = true;
        }
        return isInRange;
      }
    case false:
      xIsGreaterThan = function (target) {
        var isInRange = false;
        if (target.value > lower) {
          isInRange = true;
        }
        return isInRange;
      }
    default:
      xIsGreaterThan = function (target) {
        var isInRange = false;
        if (target.value > lower) {
          isInRange = true;
        }
        return isInRange;
      }
  }

  var inRangeFunc = function (target) {
    var isInRange = false;
    target.value = target.value.replace('px', '');
    target.value = target.value.replace('%', '');
    if (xIsLessThan(target) && xIsGreaterThan(target)) {
      isInRange = true;
    }
    return isInRange;
  }

  return this.gradebook.grade({
    callback: inRangeFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
};

/**
 * Check that the value includes at least one of the given expected values.
 * @param  {Array} expectedValues - search for one of the values in the array
 * @param  {Object} config - includes: nValues, minValues, maxValues. Designate the number of values in expectedValues expected to be found in the target value. Defaults to at least one value needs to be found.
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.toHaveSubstring = function (expectedValues, config) {
  config = config || {};

  var self = this;
  // make sure expectedValues are an array
  if (!(expectedValues instanceof Array)) {
    expectedValues = [expectedValues];
  };

  var nInstances            = config.nInstances || false,   // TODO: not being used (is there a good use case?)
      minInstances          = config.minInstances || 1,     // TODO: not being used
      maxInstances          = config.maxInstances || false, // TODO: not being used
      nValues               = config.nValues || false,
      minValues             = config.minValues || 1,
      maxValues             = config.maxValues || 'all';

  if (maxValues === 'all') {
    maxValues = expectedValues.length;
  };

  /**
   * Is there a substring in a string? This will answer that question.
   * @param  {object} target - the Target in question
   * @return {boolean} - whether or not expected substring is in target.value
   */
  var substringFunc = function (target) {
    var hasNumberOfValsExpected = false;
    var hits = 0;
    expectedValues.forEach(function(val, index, arr) {
      if (target.value.search(val) > -1) {
        hits+=1;
      };
    });

    if (nValues) {
      (hits === nValues) ? hasNumberOfValsExpected = true : hasNumberOfValsExpected = false;
    } else if (hits >= minValues && hits <= maxValues) {
      hasNumberOfValsExpected = true;
    };
    return hasNumberOfValsExpected;
  };

  return this.gradebook.grade({
    callback: substringFunc,
    not: this.gradeOpposite,
    strictness: this.picky
  })
}