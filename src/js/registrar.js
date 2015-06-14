
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
Assume that each web component has properties defined with attributes
Use attributeChangedCallback on each web component to update its values

The hotel simply changes the attributes on each web component
 */

var hotel = {
  occupiedSuites: [],
  createSuite: function (rawSuite) {
    var suite = new Suite(rawSuite);

    // pass the whole suite to the testResults so you can modify it there later.
    suite.element = testResults.buildSuiteElement(suite);
    this.occupiedSuites.push(suite);
    return suite;
  }
};

Object.defineProperties(hotel, {
  numberOfPassedSuites: {
    get: function () {
      var numberPassed = 0;
      this.occupiedSuites.forEach(function (suite, index, arr) {
        if (suite.suitePassed) {
          numberPassed += 1;
        }
      })
      return numberPassed;
    }
  },
  numberOfSuites: {
    get: function () {
      return this.occupiedSuites.length;
    }
  },
  allCorrect: {
    get: function () {
      var allCorrect = false;
      (this.numberOfSuites === this.numberOfPassedSuites) ? allCorrect = true : allCorrect = false;
      // TODO: maybe emit an event if all of them pass?
      return allCorrect;
    }
  }
})

/**
 * Register a suite of tests with the grading engine.
 * @param  {Object} _suite - contains a test's name and code to display upon completion.
 * @return {Function} registerTest - a method to register a single test with the grading engine.
 */
function registerSuite(rawSuite) {
  var self = this;

  var newSuite = hotel.createSuite(rawSuite);

  /**
   * Register a new test on a specific suite. The test will contain an activeTest. Each active test much return a boolean called isCorrect and an array of the targets in question.
   * @param  {Object} _test - contains a description, activeTest and flags.
   * @return {Object} self - for chaining tests registrations together (if you're into that sort of syntax.)
   */
  function registerTest(_test) {
    newSuite.createTest({
      description: _test.description,
      activeTest: _test.active_test,
      flags: _test.flags,
      iwant: new TA()
    })
    return self;
  }
  return {
    registerTest: registerTest
  }
}

// basically for use only when loading a new JSON with suites
function registerSuites(suites) {
  suites.forEach(function (suite, index, arr) {
    var newSuite = registerSuite({
      name: suite.name,
      code: suite.code,
    });

    newSuite.tests.forEach(function (test) {
      // to account for old APIs
      var activeTestTemp = test.activeTest || test.active_test;

      newSuite.registerTest({
        description: test.description,
        activeTest: test.activeTestTemp,
        flags: test.flags
      })
    })

  })
};

exports.registerSuite = registerSuite;
exports.registerSuites = registerSuites;