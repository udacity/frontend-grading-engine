
/***
 *    ______           _     _                  
 *    | ___ \         (_)   | |                 
 *    | |_/ /___  __ _ _ ___| |_ _ __ __ _ _ __ 
 *    |    // _ \/ _` | / __| __| '__/ _` | '__|
 *    | |\ \  __/ (_| | \__ \ |_| | | (_| | |   
 *    \_| \_\___|\__, |_|___/\__|_|  \__,_|_|   
 *                __/ |                         
 *               |___/                          
 */
/*
    Expose functions that create and monitor tests.
*/
  
  /*
    TODO:
        Refactor so that only registerSuite is exposed?
        Improve id with a random number first
  */
  var suites = [];
  function registerSuite(_suite) {
    var thisSuite = _suite.name;
    suites.push({
      name: _suite.name,
      code: _suite.code,
      tests: [],
      id: Date.now()
    })
    function registerTest(_test) {
      var hit = false;
      suites.forEach(function(val, index, arr) {
        if (val.name === thisSuite) {
          hit = true;
          if (!_test.flags) _test.flags = {};
          val.tests.push({
            description: _test.description,
            active_test: _test.active_test,
            flags: _test.flags
          })
        }
      })
      if (!hit) {
        console.log("Suite " + suiteName + " was not registered. Could not add tests.");
      }
    }
    return {
      registerTest: registerTest
    }
  }
  exports.registerSuite = registerSuite;
  exports.suites = suites;