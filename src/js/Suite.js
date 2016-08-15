/*global ActiveTest, components */

/**
 * @fileOverview This file contains the constructor for a `Suite` of tests.
 * @name Suite.js<js>
 * @author Cameron Pittman
 * @license GPLv3
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
}

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
      });
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
      });
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
      });
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
  }
});

Suite.prototype.getDebugData = function() {
  this.activeTests.forEach(function(at) {
    if (at.debugData.length > 0) {
      console.warn('%c' + 'ERROR: ' + at.description + ': ' + at.debugData.join(' '), 'color: red;');
    }
  });
};

Suite.prototype.getIncorrectInfo = function() {
  this.activeTests.forEach(function(at) {
    if (at.incorrectInfo.length > 0) {
      console.warn('Incorrect: ' + at.description + ': ' + at.incorrectInfo.join('\n'));
    }
  });
};

Suite.prototype.getValues = function() {
  this.activeTests.forEach(function(at) {
    if (at.values.length > 0) {
      console.warn('Collected Values: ' + at.description + ': ' + at.values.join('\n'));
    }
  });
};

Suite.prototype.createTest = function(rawTest) {
  var activeTest = new ActiveTest(rawTest);
  activeTest.suite = this;

  function createTestElement(newTest) {
    var activeTestFragment = components.createElement('active-test');
    var activeTestElement = '';

    // When appending a fragment, it becomes void
    for(var i=0, len=activeTestFragment.childNodes.length; i<len; i++) {
      if(activeTestFragment.childNodes[i].nodeType !== 8) {
        activeTestElement = activeTestFragment.childNodes[i];
        break;
      }
    }

    // find the suite element to which the test belongs
    var activeTestsContainer = activeTest.suite.element.querySelector('.active-tests');
    // attributes get applied to the view
    activeTestElement.dataset.description = newTest.description;
    activeTestElement.dataset.testPassed = newTest.testPassed;

    // let the Test know which element belongs to it
    activeTest.element = activeTestElement;

    activeTestsContainer.appendChild(activeTestFragment);
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
  this.element.suitePassed = passed; // What’s that?
  this.element.dataset.suitePassed = passed;
  this.element.dataset.numberOfTests = this.activeTests.length;
};

// Suite.js<js> ends here
