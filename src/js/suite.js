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
    var activeTestElement = document.createElement('active-test');
    
    // find the suite element to which the test belongs
    var activeTestsContainer = test.suite.element.shadowRoot.querySelector('.active-tests');
    // attributes get applied to the view
    activeTestElement.setAttribute('description', newTest.description);
    activeTestElement.setAttribute('test-passed', newTest.testPassed);
    // give the element access to the actual test
    // activeTestElement.activeTest = newTest.activeTest;
    
    // let the Test know which element belongs to it
    test.element = activeTestElement;
    
    activeTestsContainer.appendChild(activeTestElement);
    return activeTestElement;
  }

  test.element = createTestElement({
    description: test.description,
    passed: test.testPassed
    // activeTest: test.activeTest
  });
  // can't do this here because it needs to happen in the widget
  test.runTest();
  this.activeTests.push(test);
};

Suite.prototype.checkTests = function () {
  var passed = this.allCorrect;
  this.suitePassed = passed;
  this.element.suitePassed = passed;
  this.element.setAttribute('suite-passed', passed);
};