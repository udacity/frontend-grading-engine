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

Object.defineProperties(Suite.prototype, {
  numberOfTests: {
    get: function () {
      return this.activeTests.length || 0;      
    }
  },
  numberOfCorrectTests: {
    get: function () {
      var numberCorrect = 0;
      this.activeTests.forEach(function (test) {
        if (test.testPassed) {
          numberCorrect += 1;
        }
      })
      return numberCorrect;
    }
  },
  numberOfCorrectOrOptionalTests: {
    get: function () {
      var numberCorrectOrOptional = 0;
      this.activeTests.forEach(function (test) {
        if (test.optional || test.testPassed) {
          numberCorrectOrOptional += 1;
        }
      })
      return numberCorrectOrOptional;
    }
  },
  numberOfOptionalTests: {
    get: function () {
      var numberOptional = 0;
      this.activeTests.forEach(function (test) {
        if (test.optional) {
          numberOptional += 1;
        }
      })
    }
  },
  allCorrect: {
    get: function () {
      var allGood = false;
      if (this.numberOfTests - this.numberOfCorrectOrOptionalTests <= 0) {
        allGood = true;
      }
      return allGood;
    }
  }
})

Suite.prototype.createTest = function (rawTest) {
  var test = new ActiveTest(rawTest);
  test.suite = this;

  function createTestElement(newTest) {
    var activeTest = document.createElement('active-test');
    var activeTests = test.suite.element.shadowRoot.querySelector('.active-tests');
    // activeTest.testDefinition = newTest;
    activeTest.setAttribute('description', newTest.description);
    // TODO: make attributes hyphenated!!!
    activeTest.setAttribute('test-passed', newTest.testPassed);
    test.element = activeTest;
    
    activeTest.edit = function () {
      // only coming in to the ActiveTest to grab a reference to the test for the tes editor
      testWidget.editTest(test);
    };

    activeTests.appendChild(activeTest);
    return activeTest;
  }

  test.element = createTestElement({
    description: test.description,
    passed: test.testPassed
  });
  test.runSyncTest();
  this.activeTests.push(test);
};

Suite.prototype.checkTests = function () {
  var passed = this.allCorrect;
  this.suitePassed = passed;
  this.element.suitePassed = passed;
  this.element.setAttribute('suite-passed', passed);
};