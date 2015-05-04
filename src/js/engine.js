
/***
 *     _____ _            _____            _            
 *    |_   _| |          |  ___|          (_)           
 *      | | | |__   ___  | |__ _ __   __ _ _ _ __   ___ 
 *      | | | '_ \ / _ \ |  __| '_ \ / _` | | '_ \ / _ \
 *      | | | | | |  __/ | |__| | | | (_| | | | | |  __/
 *      \_/ |_| |_|\___| \____/_| |_|\__, |_|_| |_|\___|
 *                                    __/ |             
 *                                   |___/              
 */
 /*
    Returns the Tester object.
 */

  // technically a helper function, but it's only used here
  function genIsCorrect(currCorrect, config) {
    var callback = config.callback,
        index = config.index,
        expectedVal = config.expectedVal || false,
        elem = config.elem || false,
        currVal = elem.valueSpecified || config.currVal || false;

    var isCorrect = false;
    if (index === 0) {
      isCorrect = callback(currVal, expectedVal);
    } else {
      isCorrect = currCorrect && callback(currVal, expectedVal);
    }
    return isCorrect;
  };

  // TODO: before and after
  function Tester() {
    // do prelim work?
  };
  Tester.documentValueSpecified = undefined;
  Tester.targeted = [];
  Tester.needToIterate = false;
  Tester.lastOperation = undefined;
  Tester.gradeOpposite = false;
  Tester.testingExistence = false;

  Tester.wrapUpAndReturn = function (passed) {
    // last work to be done before returning result
    var singleVal = this.documentValueSpecified;
    var multiVal = this.targeted; // probably just want their values, not the nodes

    return {
      isCorrect: passed,
      actuals: this.lastOperation  // probably should force this to be an array
    }
  }

  Tester.grade = function(callback, expectedVal) {
    var self = this;
    var isCorrect = false;

    // to adjust for not
    callback = (function(self, callback) {
      var cbFunc = function() {};
      if (self.gradeOpposite) {
        cbFunc = function(x,y) {
          var result = callback(x,y);
          return !result;
        }
      } else {
        cbFunc = function(x,y) {
          var result = callback(x,y);
          return result;
        }
      }
      return cbFunc;
    })(self, callback);

    if (this.documentValueSpecified !== undefined) {
      isCorrect = callback(this.documentValueSpecified, expectedVal);
    } else if (this.needToIterate && !this.testingExistence) {
      this.targeted.forEach(function(elem, index, arr) {
        isCorrect = genIsCorrect(isCorrect, {
          callback: callback,
          index: index,
          expectedVal: expectedVal,
          elem: elem
        })
      })
    } else if (this.testingExistence) {
      this.lastOperation.forEach(function(val, index, arr) {
        isCorrect = genIsCorrect(isCorrect, {
          callback: callback,
          index: index,
          currVal: val
        })
      })
    } else {
      isCorrect = callback();
    }
    return isCorrect;
  };

  Object.defineProperties(Tester, {
    count: {
      get: function() {
        this.documentValueSpecified = this.targeted.length;
        return this;
      }
    },
    toExist: {
      get: function() {
        this.testingExistence = true;
        var lastOperation = this.lastOperation || [];
        
        var doesExist = false;
        
        // typeof null === "object", for some insane reason. This is to correct for it.
        if (lastOperation === null) {
          lastOperation = false;
        }
        var typeOfOperation = typeof lastOperation;
        if (typeOfOperation === "object" && lastOperation instanceof Array) {
          typeOfOperation = "array";
        }

        if (typeOfOperation !== "array") {
          this.lastOperation = [lastOperation]
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
    not: {
      get: function () {
        this.gradeOpposite = true;
        return this;
      }
    }
  })

  Tester.someOf = function(x) {
    x = x || 1;
    this.someOf = x;
  }

  Tester.theseNodes = function(selector) {
    var self = this;
    this.completedTests = [];
    this.targeted = [];
    this.documentValueSpecified = undefined;
    this.lastOperation = [];

    getDomNodeArray(selector).forEach(function(elem, index, arr) {
      self.targeted.push({
        elem: elem
      })
    })
    this.lastOperation = this.targeted;
    return this;
  }

  Tester.cssProperty = function(property) {
    var self = this;
    this.needToIterate = true;
    this.lastOperation = [];
    this.targeted.forEach(function(targetObj, index, arr) {
      var styles = getComputedStyle(targetObj.elem);
      targetObj.valueSpecified = styles[property];
      self.lastOperation.push(targetObj.valueSpecified);
    })
    return this;
  }

  Tester.attribute = function(attr) {
    var self = this;
    this.needToIterate = true;
    this.lastOperation = [];
    this.targeted.forEach(function(targetObj, index, arr) {
      var attrValue = targetObj.elem.getAttribute(attr);
      if (attrValue === "") {
        attrValue = true;
      }
      targetObj.valueSpecified = attrValue;
      self.lastOperation.push(targetObj.valueSpecified);
    })
    return this;
  }

  /*
    @param: y* (any value)
    @param: noStrict/ (default: false)
  */
  Tester.toEqual = function(y, noStrict) {
    noStrict = noStrict || false;
    
    var isEqual = false;
    // TODO: needs to be more general
    var equalityFunc = function() {};
    switch (noStrict) {
      case true:
        equalityFunc = function(x, y) {
          return x == y;
        };
        break;
      case false:
        equalityFunc = function(x, y) {
          return x === y;
        };
        break;
      default:
        equalityFunc = function(x, y) {
          return x === y;
        };
        break;
    }

    isEqual = this.grade(equalityFunc, y);
    return this.wrapUpAndReturn(isEqual);
  }

  Tester.toBeGreaterThan = function(y, orEqualTo) {
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

    isGreaterThan = this.grade(greaterThanFunc, y)
    return this.wrapUpAndReturn(isGreaterThan);
  }

  Tester.toBeLessThan = function(y, orEqualTo) {
    orEqualTo = orEqualTo || false;
    var isLessThan = false;

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

    isLessThan = this.grade(lessThanFunc, y)
    return this.wrapUpAndReturn(isLessThan);
  }