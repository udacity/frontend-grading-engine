
/***
 *     _____ _            _____          _   
 *    |_   _| |          |  ___|        | |  
 *      | | | |__   ___  | |__ _ __   __| |  
 *      | | | '_ \ / _ \ |  __| '_ \ / _` |  
 *      | | | | | |  __/ | |__| | | | (_| |_ 
 *      \_/ |_| |_|\___| \____/_| |_|\__,_(_)
 *                                           
 *                                           
 */
 /*
    Why an IIFE? All the encapsulated goodness.
 */
  function debugMode() {
    debugMode = !debugMode;
  };
  exports.debugMode = debugMode;

  function pause() {
    
  };
  exports.pause = pause;

  return exports;
}( window ));