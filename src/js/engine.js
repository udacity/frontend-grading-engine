
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

    Instances of the test object are kept between runs! You need to clear out all the data at the start of each run.
 */



  /*
  @param: obj* (nothing yet)
  returns:
    currElems[] (array of DOM nodes)
    valueSpecified[*] (whatever property is being tested)
    someOf/ (default: false. If true, then at least one node needs to match the criteria for the test to pass)
    oneOf/ (default: false. If true, then just one node needs to match the criteria for the test to pass)
    or/ (default: false)
  */

  function genIsCorrect(currCorrect, config) {
    var callback = config.callback,
        index = config.index,
        expectedVal = config.expectedVal,
        elem = config.elem,
        currVal = elem.valueSpecified;

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

  Tester.wrapUpAndReturn = function (passed) {
    // last work to be done before returning result
    var singleVal = this.documentValueSpecified;
    var multiVal = this.targeted; // probably just want their values, not the nodes

    return {
      isCorrect: passed,
      valuesSpecified: this.valuesSpecified  // probably
    }
  }

  Tester.grade = function(callback, expectedVal) {
    var isCorrect = false;
    if (this.documentValueSpecified !== undefined) {
      isCorrect = callback(this.documentValueSpecified, expectedVal);
    } else if (this.needToIterate) {
      this.targeted.forEach(function(elem, index, arr) {
        isCorrect = genIsCorrect(isCorrect, {
          callback: callback,
          index: index,
          expectedVal: expectedVal,
          elem: elem
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
        var count = this.targeted.length;
        var doesExist = false;
        var doesExistFunc = function () {
          var doesExist = false;
          if (count > 0) {
            doesExist = true;
          }
          return doesExist;
        }
        doesExist = this.grade(doesExistFunc)
        return this.wrapUpAndReturn(doesExist);
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
    getDomNodeArray(selector).forEach(function(elem, index, arr) {
      self.targeted.push({
        elem: elem
      })
    })
    return this;
  }

  Tester.cssProperty = function(property) {
    this.needToIterate = true;
    this.targeted.forEach(function(targetObj, index, arr) {
      var styles = getComputedStyle(targetObj.elem);
      targetObj.valueSpecified = styles[property];
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
    orEqualTo = orEqualTo || false; // strict equality
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
    orEqualTo = orEqualTo || false; // strict equality
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