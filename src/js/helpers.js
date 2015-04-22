
/***
 *     _   _      _                     
 *    | | | |    | |                    
 *    | |_| | ___| |_ __   ___ _ __ ___ 
 *    |  _  |/ _ \ | '_ \ / _ \ '__/ __|
 *    | | | |  __/ | |_) |  __/ |  \__ \
 *    \_| |_/\___|_| .__/ \___|_|  |___/
 *                 | |                  
 *                 |_|                  
 */
 /*
    Wonderful functions to make life easier.
 */

  // http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
  function arrEquals(array1, array2) {
    if (!array1 || !array2)
      return false;
    if (array1.length != array2.length)
      return false;
    for (var i = 0, l=array1.length; i < l; i++) {
      if (array1[i] instanceof Array && array2[i] instanceof Array) {
        if (!array1[i].equals(array2[i]))
          return false;       
      } else if (array1[i] != array2[i]) { 
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;   
      }           
    }       
    return true;
  }

  /*
      @param: selector'' (a CSS selector)
      returns: [] of DOM nodes
  */
  function getDomNodeArray(selector) {
    return Array.prototype.slice.apply(document.querySelectorAll(selector));
  }

  /*
      @param: array[] (some array)
      @param: callback(e) (some function that takes in array change object)
      returns: this (for chaining)
  */
  // function ArrayWatcher(array, callback) {
  //   // notion of what's in the array
  //   // notion of what just happened
  //   // notion of a callback
  //   // TODO: refactor arrEquals with this too.

  //   this.arrayHistory = [];
  //   var self = this;
  //   Array.observe(array, function(e) {
  //     self.arrayHistory.push(array.slice());
  //     callback(e);
  //   });
  //   return this;
  // }

  
  //     @param: index0 (default: 0. int representing the array in history. 0 is current, 1 is before the most recent changes, etc.)
  
  // ArrayWatcher.prototype.getArrayHistory = function(index) {
  //   if (!index) {
  //     var index = 0;
  //   }
  //   if (typeof index !== 'number') {
  //     // throwException('invalid-param', this);
  //     console.log('invalid-param');
  //   }
  //   return this.arrayHistory[index];
  // }
  










