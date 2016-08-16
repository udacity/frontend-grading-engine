/*global TA */

/**
 * @fileOverview This file contains the prototype of a single running test.
 * @name ActiveTest.js<js>
 * @author Cameron Pittman
 * @license GPLv3
 */

// Custom types documentation
/**
 * An object with collector and reporter properties.
 * @typedef {Object} definition
 * @property {string} nodes - String containing a CSS selector (i.e. jQuery style).
 * @property {string} cssProperty - A CSS property written as camelCase (backgroundColor) that will be collected from {@link nodes}.
 * @property {string} attribute - An HTML attribute will be collected from {@link node}.
 * @property {AbsolutePosition} absolutePosition -
 */

/**
 * An object containing boolean properties.
 * @typedef {Object} flags
 * @property {boolean} alwaysRun - The test continues to run even after it passes.
 * @property {boolean} noRepeat  - The test runs only once rather than repeatedly.
 */

// Implementation
/**
 * Construct a single test that will be run once or repeatedly.
 * @param {string} rawTest.description - Title that shows up in the test widget list.
 * @param {flags} rawTest.flags - Flags controlling the test behaviour.
 * @param {definition} rawTest.definition -
 * @returns {}
 * @throws {}
 */
function ActiveTest(rawTest) {
  // TODO: will need to validate all of these
  this.description = rawTest.description;
  this.flags = rawTest.flags || {};
  this.id = parseInt(Math.random() * 1000000);
  this.testPassed = false;
  this.debugData = [];
  this.incorrectInfo = [];

  this.gradeRunner = function() {};
  var self = this;

  try {
    // validate the description.
    if (typeof this.description !== 'string') {
      throw new TypeError('Every test needs a description string.');
    }

    // validate the flags
    if (typeof this.flags !== 'object') {
      throw new TypeError('If assigned, flags must be an object.');
    }

    if (typeof rawTest.definition !== 'object') {
      throw new TypeError('Every test needs a definition');
    }

    // alwaysRun and noRepeat flags are mutually exclusive
    if (this.flags.alwaysRun && this.flags.noRepeat) {
      throw new TypeError('“alwaysRun” and “noRepeat” flags are mutually exclusive. Only one of them can be set.');
    }
  } catch(e) {

  }

  this.ta = new TA(this.description);

  // translates json definitions to method calls
  self.queueUp = (function(config) {
    var methodsToQueue = self.ta._translateConfigToMethods(config);
    return function() {
      methodsToQueue.forEach(function(method) {
        try {
          method();
        } catch (e) {
          self.hasErred();
          console.error(self.description + ' has an invalid definition.');
        }
      });
    };

  })(rawTest.definition);
}

/**
 * Set off the fireworks! A test passed! Assumes you mean test passed unless didPass is false.
 * @param  {Boolean}  didPass unless didPass === false, method assumes it to be true.
 * @return {Boolean}         [description]
 */
ActiveTest.prototype.hasPassed = function(didPass) {
  var attribute = null;
  if (!didPass) {
    attribute = false;
  } else {
    attribute = true;
    this.testPassed = true;

    if (!this.flags.alwaysRun || this.flags.noRepeat) {
      this.stopTest();
    }

    window.dispatchEvent(new CustomEvent('ud-test-pass', {'detail': this.description}));
  }
  this.element.dataset.testPassed = attribute;
  this.suite.checkTests();
};

ActiveTest.prototype.hasErred = function() {
  this.stopTest();
  this.element.dataset.testPassed = 'error';
};

/**
 Run a synchronous activeTest every 1000 ms
 */
ActiveTest.prototype.runTest = function() {
  var self = this;

  var noRepeat = this.flags.noRepeat || false; // run only once on load
  var alwaysRun = this.flags.alwaysRun || false; // keep running even if test passes
  var optional = this.flags.optional || false; // test does not affect code display

  var testRunner = function() {
    var promise = new Promise(function(resolve, reject) {
      // clear for every run
      self.debugData = [];
      self.values = [];
      self.incorrectInfo = [];
      // resolve when the test finishes
      self.ta.onresult = function(result) {
        resolve(result);
      };

      self.ta.onerror = function(reason, keepGoing) {
        self.debugData.push(reason);
        if (!keepGoing) {
          self.hasErred();
        }
      };

      self.ta.onincorrect = function(reason) {
        self.incorrectInfo.push(reason);
      };

      // clean out the queue from the last run
      self.ta.queue.clear();

      // this call actually runs the test
      self.queueUp();

    }).then(function(gradedTest) {
      var testCorrect = gradedTest.isCorrect;
      // TODO: nothing is done with the values. Do something?
      var testValues = '';
      gradedTest.questions.forEach(function(val) {
        testValues = testValues + ' ' + val.value;
        self.values.push(testValues);
      });

      self.hasPassed(testCorrect);
    });
  };

  if (noRepeat) {
    testRunner();
  } else {
    testRunner();
    this.gradeRunner = window.setInterval(testRunner, 1000);
  }
};

ActiveTest.prototype.stopTest = function() {
  var self = this;
  clearInterval(self.gradeRunner);
};

// ActiveTest.js<js> ends here
