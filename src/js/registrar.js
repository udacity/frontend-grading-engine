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
      this.occupiedSuites.forEach(function (suite) {
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

var userData = [];
var isOn = false;

/**
 * For use only when loading a new JSON with user data about the tests they want to run
 * @param  {JSON} suitesJSON Everything the GE needs to know about your tests
 */
function registerSuites(suitesJSON) {
  try {
    if (suitesJSON.length > 0) {
      userData = JSON.parse(suitesJSON);
    }
  } catch (e) {
    throw new Error('Invalid JSON format.');
  }
  if (userData instanceof Array !== true) {
    throw new TypeError('Invalid test format. Tests must be wrapped in an array.');
  }
  if (isOn) {
    startTests();
  }
};

function startTests() {
  userData.forEach(function (_suite) {
    var newSuite = registerSuite({
      name: _suite.name,
      code: _suite.code
    });

    _suite.tests.forEach(function (test) {
      newSuite.registerTest({
        description: test.description,
        definition: test.definition,
        flags: test.flags
      });
    });
  });
};

function turnOn() {
  if (!isOn) {
    testWidget.buildWidget();
    isOn = true;
    startTests();
  }
};

function turnOff () {
  hotel.occupiedSuites.forEach(function (suite) {
    suite.activeTests.forEach(function (activeTest) {
      activeTest.stopTest();
    });
  });
  hotel.occupiedSuites = [];
  testWidget.killWidget();
  isOn = false;
};

function debug() {
  hotel.occupiedSuites.forEach(function (suite) {
    suite.getDebugData();
    suite.getIncorrectInfo();
    suite.getValues();
  });
};

exports.debug = debug;
exports.turnOn = turnOn;
exports.turnOff = turnOff;
exports.registerSuites = registerSuites;
