
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

  // TODO: can I hide private functions in here?
  var Test = function(obj) {
    // do prelim work
    this.valueSpecified = [];
    // function log(argument) {
    //   console.log(argument)
    // }
    return this;
  }

  Test.prototype.record = function(val) {
    this.valueSpecified.push(val);
    // this.log('hi')
  }

  Test.prototype.someOf = function() {
    this.someOf = true;
  }

  Test.prototype.oneOf = function() {
    this.oneOf = true;
  }

  Test.prototype.theseNodes = function(selector) {
    this.currElems = getDomNodeArray(selector);
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
    returns: true if the value specified exists
  */
  Test.prototype.toExist = function() {
    var doesExist = false;

    if (this.valueSpecified.length > 0) {
      doesExist = true;
    }
    return doesExist;
  }

  Test.prototype.count = function() {
    this.record(this.currElems.length);
    return this;
  }

  Test.prototype.cssProperty = function(property) {
    this.iterate(function(val, index, arr) {
      var styles = getComputedStyle(val);
      this.record(styles[property]);
    })
  }

  /*
    @param: x* (any value)
    @param: noStrict/ (default: false)

    // TODO: refactor for arrays
  */
  Test.prototype.toEqual = function(x, noStrict) {
    noStrict = noStrict || false;
    
    var isEqual = false;

    switch (noStrict) {
      case true:
        if (this.valueSpecified == x) {isEqual = true}
        break;
      case false:
        if (this.valueSpecified === x) {isEqual = true}
        break;
      default:
        if (this.valueSpecified === x) {isEqual = true}
        break;
    }
    return isEqual;
  }
  exports.Test = Test;