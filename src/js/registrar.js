
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

// var suites = [];
/**
 * Register a suite of tests with the grading engine.
 * @param  {Object} _suite - contains a test's name and code to display upon completion.
 * @return {Function} registerTest - a method to register a single test with the grading engine.
 */
function registerSuite(_suite) {
  var self = this;
  var thisSuite = _suite.name;
  // suites.push({
  activeTestObserver.registerSuite({
    name: _suite.name,
    code: _suite.code,
    tests: [],
    id: parseInt(Math.random() * 1000000)
  })

  /**
   * Register a new test on a specific suite. The test will contain an active_test. Each active test much return a boolean called isCorrect and an array of the targets in question.
   * @param  {Object} _test - contains a description, active_test and flags.
   * @return {Object} self - for chaining tests registrations together (if you're into that sort of syntax.)
   */
  function registerTest(_test) {
    var hit = false;
    activeTestObserver.suites.forEach(function (suite) {
      if (suite.name === thisSuite) {
        hit = true;
        if (!_test.flags) {
          _test.flags = {};
        }
        suite.tests.push({
          description: _test.description,
          active_test: _test.active_test,
          flags: _test.flags,
          iwant: new TA()
        })
      }
    })
    if (!hit) {
      console.log("Suite " + suiteName + " was not registered. Could not add tests.");
    }
    return self;
  }
  return {
    registerTest: registerTest
  }
}
exports.registerSuite = registerSuite;
exports.suites = suites;