function ActiveTest(rawTest) {
  // TODO: will need to validate all of these
  this.description = rawTest.description;
  this.flags = rawTest.flags || {};
  this.id = parseInt(Math.random() * 1000000);
  this.testPassed = false;
  this.debugData = [];
  this.incorrectInfo = [];

  this.gradeRunner = function() {};

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

  this.ta = new TA(this.description);

  var self = this;

  // translates json definitions to method calls
  self.queueUp = (function(config) {
    var methodsToQueue = self.ta._translateConfigToMethods(config);
    return function() {
      methodsToQueue.forEach(function(method) {
        try {
          method();
        } catch (e) {
          self.hasErred();
          throw new Error(self.description + ' has an invalid definition.')
        }
      });
    };

  })(rawTest.definition);
};

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
    };
  }
  this.element.setAttribute('test-passed', attribute);
  this.suite.checkTests();
};

ActiveTest.prototype.hasErred = function() {
  this.stopTest();
  this.element.setAttribute('test-passed', 'error')
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
      }

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
