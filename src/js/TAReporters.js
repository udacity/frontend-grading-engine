/**
Reporters live on the TA and are responsible for:
  * giving the GradeBook instructions for evaluating the questions it has collected.
  * instantiating the grading process by calling gradebook.grade()

 */

/**
 * Checks that either values or elements exist on questions in GradeBook.
 */
TA.prototype.exists = function (bool) {
  var self = this;

  if (bool === false && typeof bool === 'boolean') {
    self.not(true);
  }

  this.queue.add(function () {
    var typeOfOperation = self.operations[self.operations.length - 1];

    var doesExistFunc = function () {};
    switch (typeOfOperation) {
      case 'gatherElements':
        doesExistFunc = function (topTarget) {
          var doesExist = false;
          if (topTarget.children.length > 0 || topTarget.element || topTarget.value) {
            doesExist = true;
          }
          return doesExist;
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

    var testResult = self.gradebook.grade({
      callback: doesExistFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}


/**
 * Used by the GradeBook to negate the correctness of a test.
 * @param  {Boolean} bool The gradeOpposite param gets set to this. Will default to true if it isn't present or is not specifically false.
 */
TA.prototype.not = function (bool) {
  var self = this;
  
  if (typeof bool !== 'boolean') {
    bool = true;
  }
  
  this.queue.add(function () {
    if (bool) {
      self.gradeOpposite = true;
    }
  });
};

/**
 * Check that question values match an expected value.
 * @param  {*} expected - any value to match against, but typically a string or int.
 * @param  {boolean} noStrict - check will run as === unless noStrict is true.
 */
TA.prototype.equals = function (config) {
  var self = this;
  this.queue.add(function () {
    var expected, noStrict;
    if (typeof config === 'object') {
      expected = config.expected,
      noStrict = config.noStrict || false;
    } else {
      expected = config;
    }
    
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

    var testResult = self.gradebook.grade({
      callback: equalityFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}

/**
 * Check that the target value is greater than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as >= instead of >
 */
TA.prototype.isGreaterThan = function (config) {
  var self = this;
  this.queue.add(function () {
    var expected = config.expected || config;
    var orEqualTo = config.orEqualTo || false;

    var greaterThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        greaterThanFunc = function (target) {
          var isGreaterThan = false;
          if (getUnitlessMeasurement(target.value) >= getUnitlessMeasurement(expected)) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
        break;
      default:
        greaterThanFunc = function (target) {
          var isGreaterThan = false;
          if (getUnitlessMeasurement(target.value) > getUnitlessMeasurement(expected)) {
            isGreaterThan = true;
          }
          return isGreaterThan;
        }
        break;
    }

    var testResult = self.gradebook.grade({
      callback: greaterThanFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}

/**
 * Check that the target value is less than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as <= instead of <
 */
TA.prototype.isLessThan = function(config) {
  var self = this;
  this.queue.add(function () {
    var expected = config.expected || config;
    var orEqualTo = config.orEqualTo || false;

    var lessThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        lessThanFunc = function (target) {
          var isLessThan = false;
          if (getUnitlessMeasurement(target.value) <= getUnitlessMeasurement(expected)) {
            isLessThan = true;
          }
          return isLessThan;
        }
        break;
      default:
        lessThanFunc = function (target) {
          var isLessThan = false;
          if (getUnitlessMeasurement(target.value) < getUnitlessMeasurement(expected)) {
            isLessThan = true;
          }
          return isLessThan;
        }
        break;
    }

    var testResult = self.gradebook.grade({
      callback: lessThanFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the target value is between upper and lower.
 * @param  {Number} lower - the lower bounds of the comparison
 * @param  {Number} upper - the upper bounds of the comparison
 * @param  {Boolean} lowerInclusive - if true, run lower check as >= instead of >
 * @param  {Boolean} upperInclusive - if true, run upper check as <= instead of <
 */
TA.prototype.isInRange = function(config) {
  var self = this;
  this.queue.add(function () {
    var lower = config.lower,
        upper = config.upper,
        lowerInclusive = config.lowerInclusive || true,
        upperInclusive = config.upperInclusive || true;

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

    var testResult = self.gradebook.grade({
      callback: inRangeFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the value includes at least one of the given expected values.
 * @param  {Array} expectedValues - search for one of the values in the array
 * @param  {Object} config - includes: nValues, minValues, maxValues. Designate the number of values in expectedValues expected to be found in the target value. Defaults to at least one value needs to be found.
 * @return {object} result - the GradeBook's list of questions and overall correctness.
 */
TA.prototype.hasSubstring = function (config) {
  var self = this;
  this.queue.add(function () {
    // TODO: why not just abort?
    config = config || {};
    var expectedValues = config.expectedValues;

    // this simplifies JSON syntax
    if (typeof config === 'string' || expectedValues instanceof Array) {
      expectedValues = config;
    }

    // make sure expectedValues are an array
    if (!(expectedValues instanceof Array)) {
      expectedValues = [expectedValues];
    };

    var nValues      = config.nValues || false,
        minValues    = config.minValues || 1,
        maxValues    = config.maxValues || expectedValues.length;

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

    var testResult = self.gradebook.grade({
      callback: substringFunc,
      not: self.gradeOpposite,
      strictness: self.picky
    });
    self.onresult(testResult);
  });
}

// get all the exposed methods so that the translator knows what's acceptable
var taAvailableMethods = Object.getOwnPropertyNames(TA.prototype).filter(function (key) {
  return key.indexOf('_') === -1 && key !== 'constructor';
});

TA.prototype.translateConfigToMethods = function (config) {
  var self = this;
  // return an array of anonymous functions that are closed over this scope.
  var methods = [];
  
  // so either nodes or elements works in config object
  config['nodes'] = config['nodes'] || config['elements'];
  
  var definitions = Object.keys(config);

  methods = definitions.map(function (method) {
    return function () {
      try {
        self[method](config[method]);
      } catch (e) {
        throw new Error("Method '" + method + "' did not execute. " + e);
      }
    }
  });

  return methods;
};