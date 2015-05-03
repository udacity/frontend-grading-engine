
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
    Returns the Test object.

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

  // TODO: before and after
  var Test = function(obj) {
    // do prelim work
    this.documentValueSpecified = undefined;
    this.targeted = [];
    // function log(argument) {
    //   console.log(argument)
    // }
    return this;
  };

  function genIsCorrect(currCorrect, index, callback, param) {
    var isCorrect = false;
    if (index === 0) {
      isCorrect = callback(param);
    } else {
      isCorrect = currCorrect && callback(param);
    }
    return isCorrect;
  };

  Test.prototype.grade = function(callback, val) {
    var isCorrect = false;
    // some kind of logic making sure that values exist
    if (this.documentValueSpecified) {
      isCorrect = callback(val);
    } else {
      this.targeted.forEach(function(elem, index, arr) {
        isCorrect = genIsCorrect(isCorrect, index, callback, elem)
      })
    }

    return isCorrect;
  };

  Test.prototype.wrapUpAndReturn = function (passed) {
    // last work to be done before returning result
    var singleVal = this.documentValueSpecified;
    var multiVal = this.targeted; // probably just want their values, not the nodes

    return {
      isCorrect: passed,
      valuesSpecified: this.valuesSpecified  // probably
    }
  }

  Test.prototype.someOf = function(x) {
    x = x || 1;
    this.someOf = x;
  }

  Test.prototype.theseNodes = function(selector) {
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

  Test.prototype.iterate = function(callback) {
    this.currElems.forEach(function(val, index, arr) {
      callback(val, index, arr);
    })
    return this;
  }

  /*
    @param: none
    returns: true if the element specified exists
  */
  Test.prototype.toExist = function() {
    var doesExist = false;

    var count = this.targeted.length;

    if (count > 0) {
      doesExist = true;
    }
    return this.wrapUpAndReturn(doesExist);
  }

  Test.prototype.length = function() {
    this.documentValueSpecified = this.targeted.length;
    return this;
  }

  Test.prototype.cssProperty = function(property) {
    this.targeted.forEach(function(targetObj, index, arr) {
      var styles = getComputedStyle(targetObj.elem);
      targetObj.valueSpecified = styles[property];
    })
    return this;
  }

  /*
    @param: x* (any value)
    @param: noStrict/ (default: false)
  */
  Test.prototype.toEqual = function(x, noStrict) {
    noStrict = noStrict || false;
    
    var isEqual = false;

    // TODO: needs to be more general
    var equalityFunc = function() {};
    switch (noStrict) {
      case true:
        equalityFunc = function(elem) {
          return elem.valueSpecified == x;
        };
        break;
      case false:
        equalityFunc = function(elem) {
          return elem.valueSpecified === x;
        };
        break;
      default:
        equalityFunc = function(elem) {
          return elem.valueSpecified === x;
        };
        break;
    }

    isEqual = this.grade(equalityFunc);
    return this.wrapUpAndReturn(isEqual);
  }

  Test.prototype.toBeGreaterThan = function(x, orEqualTo) {
    orEqualTo = orEqualTo || undefined; // strict equality
    var isGreaterThan = false;

    if (this.valueSpecified > x) {
      isGreaterThan = true;
    } else if (orEqualTo && this.valueSpecified === x) {
      isGreaterThan = true;
    }

    var greaterThanFunc = function() {};
    switch (orEqualTo) {
      case true:
        func = function (x) {
          var isGreaterThan = false;
          // if ( >= )
          return isGreaterThan;
        }
    }

    isGreaterThan = this.grade(greaterThanFunc)
    return this.wrapUpAndReturn(isGreaterThan);
  }

  Test.prototype.toBeLessThan = function(x, orEqualTo) {
    orEqualTo = orEqualTo || undefined; // strict equality
    var isLessThan = false;

    if (this.valueSpecified < x) {
      isLessThan = true;
    } else if (orEqualTo && this.valueSpecified === x) {
      isLessThan = true;
    }
    return this.wrapUpAndReturn(isLessThan);
  }

  exports.Test = Test;