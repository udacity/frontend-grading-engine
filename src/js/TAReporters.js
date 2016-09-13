/**
 * @fileOverview Reporters live on the TA and are responsible for:
   * giving the GradeBook instructions for evaluating the questions it has collected.
   * instantiating the grading process by calling gradebook.grade()
 * @name TAReporters.js<js>
 * @author Cameron Pittman
 * @license GPLv3
 */

/**
 * Checks that either values or elements exist on questions in GradeBook.
 */
TA.prototype.exists = function(bool) {
  var self = this;

  if (bool === false && typeof bool === 'boolean') {
    self.not(true);
  }

  this.queue.add(function() {
    var typeOfOperation = self.operations[self.operations.length - 1];

    var doesExistFunc = function() {};
    switch (typeOfOperation) {
      case 'gatherElements':
        doesExistFunc = function(topTarget) {
          var doesExist = false;
          if (topTarget.children.length > 0 || topTarget.element || topTarget.value) {
            doesExist = true;
          }
          if (!doesExist) {
            self.onincorrect('does not exist');
          }
          return doesExist;
        };
        break;
      case 'gatherDeepChildElements':
        doesExistFunc = function(target) {
          var doesExist = false;
          if (target.element) {
            doesExist = true;
          }
          if (!doesExist) {
            self.onincorrect('does not exist');
          }
          return doesExist;
        };
        break;
      default:
        doesExistFunc = function(target) {
          var doesExist = false;
          if (target.value || target.element) {
            doesExist = true;
          }
          if (!doesExist) {
            self.onincorrect('does not exist');
          }
          return doesExist;
        };
        break;
    }

    var testResult = self.gradebook.grade({
      callback: doesExistFunc,
      not: self.gradeOpposite,
      strictness: self.strictness
    });
    self.onresult(testResult);
  });
};


/**
 * Used by the GradeBook to negate the correctness of a test.
 * @param  {Boolean} bool The gradeOpposite param gets set to this. Will default to true if it isn’t present or is not specifically false.
 */
TA.prototype.not = function(bool) {
  var self = this;

  if (typeof bool !== 'boolean') {
    bool = true;
  }

  this.queue.add(function() {
    if (bool) {
      self.gradeOpposite = true;
    }
  });
};

/**
 * Check that question values match an expected value. Always uses strict equality.
 * @param  {*} expected - string, number or array of string and numbers.
 */
TA.prototype.equals = function(config) {
  var self = this;
  this.queue.add(function() {
    var expected;
    if (typeof config === 'object' && !(config instanceof Array)) {
      expected = config.expected;
    } else {
      expected = config;
    }

    if (typeof expected !== 'string' && typeof expected !== 'number' && !(expected instanceof Array)) {
      self.onerror('“equals” needs a string, a number, or an array of string and number values.');
      throw new Error();
    }

    if (!(expected instanceof Array)) {
      expected = [expected];
    }

    var equalityFunc = function(target) {
      var isCorrect = false;

      expected.forEach(function(e) {
        if (target.value === e) {
          isCorrect = true;
        }
      });

      if (!isCorrect) {
        self.onincorrect(target.value.toString() + ' is not one of: [' + expected.join(', ') + '].');
      }
      return isCorrect;
    };

    var testResult = self.gradebook.grade({
      callback: equalityFunc,
      not: self.gradeOpposite,
      strictness: self.strictness
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the target value is greater than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as >= instead of >
 */
TA.prototype.isGreaterThan = function(config) {
  var self = this;
  this.queue.add(function() {
    var expected = config.expected || config;
    var orEqualTo = config.orEqualTo || false;

    if (typeof expected !== 'number') {
      self.onerror('“isGreaterThan” needs a number.');
      throw new Error();
    }

    var greaterThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        greaterThanFunc = function(target) {
          var isGreaterThan = false;
          if (getUnitlessMeasurement(target.value) >= getUnitlessMeasurement(expected)) {
            isGreaterThan = true;
          }
          if (!isGreaterThan) {
            self.onincorrect(target.value + ' is not greater than ' + expected);
          }
          return isGreaterThan;
        };
        break;
      default:
        greaterThanFunc = function(target) {
          var isGreaterThan = false;
          if (getUnitlessMeasurement(target.value) > getUnitlessMeasurement(expected)) {
            isGreaterThan = true;
          }
          if (!isGreaterThan) {
            self.onincorrect(target.value + ' is not greater than ' + expected);
          }
          return isGreaterThan;
        };
        break;
    }

    var testResult = self.gradebook.grade({
      callback: greaterThanFunc,
      not: self.gradeOpposite,
      strictness: self.strictness
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the target value is less than the given value.
 * @param  {Number} expected - the number for comparison
 * @param  {boolean} orEqualTo - if true, run as <= instead of <
 */
TA.prototype.isLessThan = function(config) {
  var self = this;
  this.queue.add(function() {
    var expected = config.expected || config;
    var orEqualTo = config.orEqualTo || false;

    if (typeof expected !== 'number') {
      self.onerror('“isLessThan” needs a value.');
      throw new Error();
    }

    var lessThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        lessThanFunc = function(target) {
          var isLessThan = false;
          if (getUnitlessMeasurement(target.value) <= getUnitlessMeasurement(expected)) {
            isLessThan = true;
          }
          if (!isLessThan) {
            self.onincorrect(target.value + ' is not less than ' + expected);
          }
          return isLessThan;
        };
        break;
      default:
        lessThanFunc = function(target) {
          var isLessThan = false;
          if (getUnitlessMeasurement(target.value) < getUnitlessMeasurement(expected)) {
            isLessThan = true;
          }
          if (!isLessThan) {
            self.onincorrect(target.value + ' is not less than ' + expected);
          }
          return isLessThan;
        };
        break;
    }

    var testResult = self.gradebook.grade({
      callback: lessThanFunc,
      not: self.gradeOpposite,
      strictness: self.strictness
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
  // TODO: would be fantastic to use isLessThan and isGreaterThan instead
  var self = this;
  this.queue.add(function() {
    var lower = getUnitlessMeasurement(config.lower);
    var upper = getUnitlessMeasurement(config.upper);
    var lowerInclusive = config.lowerInclusive || true;
    var upperInclusive = config.upperInclusive || true;

    // just in case someone screws up the order
    if (lower > upper) {
      var temp = lower;
      lower = upper;
      upper = temp;
    };

    if (typeof lower !== 'number' || typeof upper !== 'number') {
      self.onerror("“isInRange” needs an upper and a lower value in its config object.");
      throw new Error();
    }

    var xIsLessThan = function() {};
    switch (upperInclusive) {
      case true:
        xIsLessThan = function(target) {
          var isInRange = false;
          if (getUnitlessMeasurement(target.value) <= getUnitlessMeasurement(upper)) {
            isInRange = true;
          }
          if (!isInRange) {
            self.onincorrect(target.value + ' is not less than ' + upper);
          }
          return isInRange;
        };
        break;
      default:
        xIsLessThan = function(target) {
          var isInRange = false;
          if (getUnitlessMeasurement(target.value) < getUnitlessMeasurement(upper)) {
            isInRange = true;
          }
          if (!isInRange) {
            self.onincorrect(target.value + ' is not less than ' + upper);
          }
          return isInRange;
        };
        break;
    }

    var xIsGreaterThan = function() {};
    switch (lowerInclusive) {
      case true:
        xIsGreaterThan = function(target) {
          var isInRange = false;
          if (getUnitlessMeasurement(target.value) >= getUnitlessMeasurement(lower)) {
            isInRange = true;
          }
          if (!isInRange) {
            self.onincorrect(target.value + ' is not greater than ' + lower);
          }
          return isInRange;
        };
        break;
      default:
        xIsGreaterThan = function(target) {
          var isInRange = false;
          if (getUnitlessMeasurement(target.value) > getUnitlessMeasurement(lower)) {
            isInRange = true;
          }
          if (!isInRange) {
            self.onincorrect(target.value + ' is not greater than ' + lower);
          }
          return isInRange;
        };
        break;
    }

    var inRangeFunc = function(target) {
      var isInRange = false;
      if (xIsLessThan(target) && xIsGreaterThan(target)) {
        isInRange = true;
      }
      return isInRange;
    };

    var testResult = self.gradebook.grade({
      callback: inRangeFunc,
      not: self.gradeOpposite,
      strictness: self.strictness
    });
    self.onresult(testResult);
  });
};

/**
 * Check that the value includes at least one of the given expected values.
 * @param  {Array} expectedValues - search for one of the values in the array using regex
 * @param  {Object} config - includes: nValues, minValues, maxValues. Designate the number of values in expectedValues expected to be found in the target value. Defaults to at least one value needs to be found.
 * @return {object} result - the GradeBook’s list of questions and overall correctness.
 */
TA.prototype.hasSubstring = function(config) {
  var self = this;
  this.queue.add(function() {
    config = config || '';
    var expectedValues = config.expected;

    // this simplifies JSON syntax
    if (typeof config === 'string' || config instanceof Array) {
      expectedValues = config;
    }

    // make sure expectedValues are an array
    if (!(expectedValues instanceof Array)) {
      expectedValues = [expectedValues];
    };

    var nValues      = config.nValues || false;
    var minValues    = config.minValues || 1;
    var maxValues    = config.maxValues || expectedValues.length;

    if (!expectedValues || expectedValues.length === 0) {
      self.onerror('“hasSubstring” needs at least one regex comparison.');
      throw new Error();
    };

    if (typeof minValues !== 'number' || typeof maxValues !== 'number') {
      self.onerror('“hasSubstring” “minValue” and “maxValue” need to be numbers.');
      throw new Error();
    };

    /**
     * Is there a substring in a string? This will answer that question.
     * @param  {object} target - the Target in question
     * @return {boolean} - whether or not expected substring is in target.value
     */
    var substringFunc = function(target) {
      var hasNumberOfValsExpected = false;
      var hits = 0;
      expectedValues.forEach(function(val) {
        var matches = target.value.match(new RegExp(val)) || [];
        if (matches.length > 0) {
          hits += 1;
        } else {
          self.onincorrect(val + ' did not hit against ' + target.value.slice(0, 20));
        }
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
      strictness: self.strictness
    });
    self.onresult(testResult);
  });
};

// get all the exposed methods so that the translator knows what’s acceptable
var taAvailableMethods = Object.getOwnPropertyNames(TA.prototype).filter(function(key) {
  return key.indexOf('_') === -1 && key !== 'constructor';
});

TA.prototype._translateConfigToMethods = function(config) {
  var self = this;
  // return an array of anonymous functions that are closed over this scope.
  var methods = [];

  // so either nodes or elements works in config object
  config['nodes'] = config['nodes'] || config['elements'];

  var definitions = Object.keys(config);

  methods = definitions.map(function(method) {
    return function() {
      try {
        self[method](config[method]);
      } catch (e) {
        self.onerror('Method “' + method + '” did not execute. ' + e);
        throw new Error();
      }
    };
  });

  return methods;
};

// TAReporters.js<js> ends here
