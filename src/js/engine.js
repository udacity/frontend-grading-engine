
  function getDomNodeArray(selector) {
    return Array.prototype.slice.apply(document.querySelectorAll(selector))
  }



  /*
  currElems[]
  valueSpecified*

  */

  var uda = function(selector) {
    this.currElems = getDomNodeArray(selector);
    console.log("i want");
    return this;
  }

  uda.prototype.count = function() {
    console.log("count");
    console.log();
    this.valueSpecified = this.currElems.length;
    return this;
  }
  uda.prototype.toStrictEqual = function(x) {
    // TODO: check if extra arguments. If so, make this an `or` test for all args

    var isStrictEqual = false;
    console.log("toStrictEqual");
    if (this.valueSpecified === x) {isStrictEqual = true}
    return isStrictEqual;
  }

  var iwant = new uda('div')

  console.log(iwant.count().toStrictEqual(75));