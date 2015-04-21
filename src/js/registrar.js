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
  
  // TODO: it would be super cool if suites could report what's going on with it
  var suites = [];
  function registerSuites(_suites) {
    var b = document.body;
    
    function registerSuite(_suite) {
      suites.push({
        name: _suite.name,
        code: _suite.code
      })
      // var newSuite = new CustomEvent('new-suite', {'detail': {'name': _suite.name, 'code': _suite.code}})
      // b.dispatchEvent(newSuite);
    }

    _suites.forEach(function(val, index, arr) {
      registerSuite(val);
    })

    function registerTest(suiteName, test) {
      var hit = false;
      suites.forEach(function(val, index, arr) {
        if (val.name === suiteName) {
          hit = true;
          val.tests = [
            {
              desc: test.desc,
              func: test.func,
              params: test.params,
              flags: test.flags
            }
          ]
        }
        // var newTest = new CustomEvent('new-test', {'detail': {'suiteName': suiteName, 'test': test}})
        // b.dispatchEvent(newSuite);
      })
      if (!hit) {
        console.log("Suite " + suiteName + " was not registered. Could not add tests.");
      }
    }
    return {
      registerTest: registerTest
    }
  }
  exports.registerSuites = registerSuites;
  exports.suites = suites;