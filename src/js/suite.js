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
    get: function() {
      return this.activeTests.length || 0;
    }
  },
  numberOfCorrectTests: {
    get: function() {
      var numberCorrect = 0;
      this.activeTests.forEach(function(test) {
        if (test.testPassed) {
          numberCorrect += 1;
        }
      })
      return numberCorrect;
    }
  },
  numberOfCorrectOrOptionalTests: {
    get: function() {
      var numberCorrectOrOptional = 0;
      this.activeTests.forEach(function(test) {
        if (test.optional || test.testPassed) {
          numberCorrectOrOptional += 1;
        }
      })
      return numberCorrectOrOptional;
    }
  },
  numberOfOptionalTests: {
    get: function() {
      var numberOptional = 0;
      this.activeTests.forEach(function(test) {
        if (test.optional) {
          numberOptional += 1;
        }
      })
    }
  },
  allCorrect: {
    get: function() {
      var allGood = false;
      if (this.numberOfTests - this.numberOfCorrectOrOptionalTests <= 0) {
        allGood = true;
      }
      return allGood;
    }
  },
})

Suite.prototype.getDebugData = function() {
  this.activeTests.forEach(function(at) {
    if (at.debugData.length > 0) {
      console.log('%c' + at.description + ' : ' + at.debugData.join(' '), 'color: red;');
    }
  });
}

Suite.prototype.createTest = function(rawTest) {
  var activeTest = new ActiveTest(rawTest);
  activeTest.suite = this;

  function createTestElement(newTest) {
    var activeTestElement = document.createElement('active-test');

    // find the suite element to which the test belongs
    var activeTestsContainer = activeTest.suite.element.shadowRoot.querySelector('.active-tests');
    // attributes get applied to the view
    activeTestElement.setAttribute('description', newTest.description);
    activeTestElement.setAttribute('test-passed', newTest.testPassed);

    // let the Test know which element belongs to it
    activeTest.element = activeTestElement;

    activeTestsContainer.appendChild(activeTestElement);
    return activeTestElement;
  }

  activeTest.element = createTestElement({
    description: activeTest.description,
    passed: activeTest.testPassed,
    definition: activeTest.definition
  });

  this.activeTests.push(activeTest);
  activeTest.runTest();
};

Suite.prototype.checkTests = function() {
  var passed = this.allCorrect;
  this.suitePassed = passed;
  this.element.suitePassed = passed;
  this.element.setAttribute('suite-passed', passed);
  this.element.setAttribute('number-of-tests', this.activeTests.length);
};
