
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

function Suite(rawSuite) {
  var name = rawSuite.name;
  var code = rawSuite.code;
  var activeTests = [];
  var id = parseInt(Math.random() * 1000000);

  // validate the name
  if (typeof name !== 'string') {
    throw new TypeError('Every suite needs a name string.');
  }

  // validate the code
  if (typeof code !== 'string') {
    throw new TypeError('Every suite needs a code string.');
  }

  this.name = name;
  this.code = code;
  this.activeTests = [];
  this.id = id;
  this.suitePassed = false; // put a setter on this to emit an event.
};

Suite.prototype.createTest = function (rawTest) {
  var test = new ActiveTest(rawTest);
  test.suite = this;

  function createTestElement(newTest) {
    var activeTest = document.createElement('active-test');
    var activeTests = test.suite.element.shadowRoot.querySelector('.active-tests');
    // activeTest.testDefinition = newTest;
    activeTest.setAttribute('description', newTest.description);
    activeTest.setAttribute('testPassed', newTest.testPassed);
    
    activeTest.edit = function () {
      console.log('hi!')
    };

    activeTests.appendChild(activeTest);
    return activeTest;
  }

  test.element = createTestElement({
    description: test.description,
    passed: test.testPassed
  });
  this.activeTests.push(test);
};

function ActiveTest(rawTest) {
  var description = rawTest.description;
  var activeTest = rawTest.activeTest;
  var flags = rawTest.flags || {};
  var parentSuiteName = rawTest.parentSuiteName;

  var id = parseInt(Math.random() * 1000000);

  // validate the description
  if (typeof description !== 'string') {
    throw new TypeError('Every suite needs a description string.');
  }

  // validate the activeTest
  if (typeof activeTest !== 'function') {
    throw new TypeError('Every suite needs an activeTest function.');
  }

  // validate the flags
  if (typeof flags !== 'object') {
    throw new TypeError('If assigned, flags must be an object.');
  }

  this.description = description;
  this.activeTest = activeTest;
  this.flags = flags;
  this.id = id;
  this.testPassed = false;  // put a setter on this to tell the suite to check if all tests passed.

  this.iwant = new TA();
};

ActiveTest.prototype.runSyncTest = function () {
  /*
  Run a synchronous activeTest every 1000 ms
  @param: none
  */
  var gradeRunner;
  var self = this;

  /*
  Optional flags specific to the test
  */
  var noRepeat = this.flags.noRepeat || false; // run only once on load
  var repeat = this.flags.repeat || false; // keep running even if test passes
  var async = this.flags.async || false;  // async
  var showCurrent = this.flags.showCurrent || false;  // TODO: show currently resolved value
  var optional = this.flags.optional || false; // test does not affect code display

  var runTest = function () {
    // run the test
    try {
      var testResult = this.activeTest(iwant);
      testCorrect = testResult.isCorrect;
      
      var testValues = '';
      testResult.questions.forEach(function(val, index, arr) {
        testValues = testValues + ' ' + val.value;
      })
      tr.innerHTML = testValues;
    } catch (e) {
      // if (e instanceof TypeError) {
      //   throw new Error("Test: " + this.activeTest + " failed to execute. Does your activeTest return an object with isCorrect and actuals properties?");
      // }  // less than useful...
      throw new Error("Test: " + this.activeTest + " failed to execute because: " + e);
    }
    // update the widget
    if (testCorrect) {
      self.testPassed = true;
      console.log('test passed');
    } else if (repeat && !testCorrect) {
      console.log('test failed')
    }

    // clear the interval (if applicable)
    if (testCorrect || noRepeat) {
      clearInterval(gradeRunner);
    }
  };

  clearInterval(gradeRunner);
  gradeRunner = setInterval(runTest, 1000);
};

ActiveTest.prototype.update = function (config) {
  var description = config.description || false;
  var activeTest = config.activeTest || false;
  var flags = config.flags || false;

  if (description) {
    this.description = description;
  };
  if (activeTest) {
    this.activeTest = activeTest;
  };
  if (flags) {
    this.flags = flags;
  };
};


/*
Assume that each web component has properties defined with attributes
Use attributeChangedCallback on each web component to update its values

The hotel simply changes the attributes on each web component
 */

var hotel = {
  occupiedSuites: [],
  createSuite: function (rawSuite) {
    var suite = new Suite(rawSuite);
    suite.element = testResults.buildSuiteElement({
      name: suite.name,
      code: suite.code
    });
    this.occupiedSuites.push(suite);

    // pretty sure this is a necessary step. can't just return the same suite. want to return the suite as it is in this.occupiedSuites
    var suiteIndex = this.occupiedSuites.length - 1;

    return this.occupiedSuites[suiteIndex];
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
// exports.hotel = hotel;