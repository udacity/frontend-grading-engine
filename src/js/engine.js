
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
    newElems[[]] (array of DOM node arrays)
    valueSpecified* (whatever property is being tested)
    or/ (default: false)
  */
  var Test = function(obj) {
    // do prelim work
    this.currElems = undefined;
    // this.newElems = [];
    return this;
  }

  Test.prototype.theseNodes = function(selector) {
    this.currElems = getDomNodeArray(selector);
    return this;
  };

  Test.prototype.count = function() {
    this.valueSpecified = this.currElems.length;
    return this;
  }
  /*
    @param: x* (any value)
    @param: noStrict/ (default: false)
  */
  Test.prototype.toEqual = function(x, noStrict) {
    if (!noStrict) noStrict = false;

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