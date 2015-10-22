function ActiveTest(rawTest) {
  // TODO: will need to validate all of these
  this.description = rawTest.description;
  this.flags = rawTest.flags || {};
  this.id = parseInt(Math.random() * 1000000);
  this.testPassed = false;

  this.gradeRunner = function() {};

  // TODO: move this validation stuff out of here
  // validate the description.
  if (typeof this.description !== 'string') {
    throw new TypeError("Every suite needs a description string.");
  }

  // validate the flags
  if (typeof this.flags !== 'object') {
    throw new TypeError('If assigned, flags must be an object.');
  }

  this.iwant = new TA();

  var self = this;
  this.activeTest = (function (config) {
    var methodsToQueue = self.iwant.translateConfigToMethods(config);

    var queueUp = function () {
      methodsToQueue.forEach(function (method) {
        method();
      });
    };

    return {
      queueUp: queueUp
    }

  })(rawTest.definition);
};

/**
 * Set off the fireworks! A test passed! Assumes you mean test passed unless didPass is false.
 * @param  {Boolean}  didPass unless didPass === false, method assumes it to be true.
 * @return {Boolean}         [description]
 */
ActiveTest.prototype.hasPassed = function (didPass) {
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

/**
Run a synchronous activeTest every 1000 ms
*/
ActiveTest.prototype.runTest = function () {
  var self = this;

  var noRepeat = this.flags.noRepeat || false; // run only once on load
  var alwaysRun = this.flags.alwaysRun || false; // keep running even if test passes
  var optional = this.flags.optional || false; // test does not affect code display

  var testRunner = function () {
    // run the test
    var promise = new Promise(function (resolve, reject) {
      // resolve when the test finishes
      self.iwant.onresult = function (result) {
        resolve(result);
      };
      // clean out the queue from the last run
      self.iwant.queue.clear();
      
      // this call actually runs the test
      self.activeTest.queueUp();

    }).then(function (resolve) {
      var testCorrect = resolve.isCorrect || false;
      var testValues = '';
      resolve.questions.forEach(function (val) {
        testValues = testValues + ' ' + val.value;
      });
      self.hasPassed(testCorrect);
    });
  };

  this.gradeRunner = window.setInterval(testRunner, 1000);
};

ActiveTest.prototype.stopTest = function () {
  clearInterval(this.gradeRunner);
};