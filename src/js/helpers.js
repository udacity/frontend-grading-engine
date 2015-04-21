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
    // if the other array is a falsy value, return
    if (!array1 || !array2)
      return false;

    // compare lengths - can save a lot of time 
    if (array1.length != array2.length)
      return false;

    for (var i = 0, l=array1.length; i < l; i++) {
      // Check if we have nested arrays
      if (array1[i] instanceof Array && array2[i] instanceof Array) {
        // recurse into the nested arrays
        if (!array1[i].equals(array2[i]))
          return false;       
      } else if (array1[i] != array2[i]) { 
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;   
      }           
    }       
    return true;
  }

  function getDomNodeArray(selector) {
    return Array.prototype.slice.apply(document.querySelectorAll(selector))
  }

  function ArrayWatcher(array, callback) {
    // notion of what's in the array
    // notion of what just happened
    // notion of a callback
    // TODO: refactor arrEquals with this too.

    return this
  }