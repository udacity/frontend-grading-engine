/*
  Expose functions that create and monitor tests.
*/

/*
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
      definition: _test.definition,
      flags: _test.flags
    })
    return self;
  }
  return {
    registerTest: registerTest
  }
}

// basically for use only when loading a new JSON with suites
function registerSuites(suitesJSON) {
  try {
    var suites = JSON.parse(suitesJSON);
  } catch (e) {
    throw new TypeError("Invalid JSON format." + e);
  }
  suites.forEach(function (suite) {
    var newSuite = registerSuite({
      name: suite.name,
      code: suite.code
    });

    suite.tests.forEach(function (test) {
      newSuite.registerTest({
        description: test.description,
        definition: test.definition,
        flags: test.flags
      });
    });
  });
};

// exports.registerSuite = registerSuite;
exports.registerSuites = registerSuites;