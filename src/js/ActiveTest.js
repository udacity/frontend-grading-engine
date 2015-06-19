function ActiveTest(rawTest) {
  var description = rawTest.description;
  var activeTest = rawTest.activeTest;
  var flags = rawTest.flags || {};

  // TODO: validate flags
  // this specific validation is probably less than useful...
  if (flags.alwaysRun === undefined) {
    flags.alwaysRun = false;
  }

  var parentSuiteName = rawTest.parentSuiteName;

  var id = parseInt(Math.random() * 1000000);

  // TODO: move this out of here
  // validate the description.
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
  this.testPassed = false;
  this.optional = flags.optional;

  this.iwant = new TA();
};

/**
 * Set off the fireworks! A test passed! Assumes you mean test passed unless didPass is false.
 * @param  {Boolean}  didPass unless didPass === false, method assumes it to be true.
 * @return {Boolean}         [description]
 */
ActiveTest.prototype.hasPassed = function (didPass) {
  var attribute = null;
  if (didPass === false) {
    attribute = false;
  } else {
    attribute = true;
    this.testPassed = true;
    
    if (!this.flags.alwaysRun || this.flags.noRepeat) {
      this.stop();
    };
  }
  this.element.setAttribute('test-passed', attribute);
  this.suite.checkTests();
};


ActiveTest.prototype.runSyncTest = function () {
  /*
  Run a synchronous activeTest every 1000 ms
  @param: none
  */
  var self = this;

  /*
  Optional flags specific to the test
  */
  var noRepeat = this.flags.noRepeat || false; // run only once on load
  var alwaysRun = this.flags.alwaysRun || false; // keep running even if test passes
  var async = this.flags.async || false;  // async
  var showCurrent = this.flags.showCurrent || false;  // TODO: show currently resolved value
  var optional = this.flags.optional || false; // test does not affect code display

  var runTest = function () {
    // run the test
    var testResult = self.activeTest(self.iwant);
    var testCorrect = testResult.isCorrect || false;
    
    var testValues = '';
    testResult.questions.forEach(function (val) {
      testValues = testValues + ' ' + val.value;
    })

    self.hasPassed(testCorrect);
  };

  clearInterval(this.gradeRunner);
  this.gradeRunner = setInterval(runTest, 1000);
};

ActiveTest.prototype.stop = function () {
  clearInterval(this.gradeRunner);
};

ActiveTest.prototype.update = function (config) {
  // TODO: need to convert config.activeTest into a function
  var description = config.description || false;
  var activeTest = config.activeTest || false;
  var flags = config.flags || false;

  // TODO: validate these!!! move validation logic to its own method on ActiveTest?
  // create setter for properties to check if valid???
  if (description) {
    this.description = description;
    this.element.setAttribute('description', this.description);
  };
  if (activeTest) {
    this.activeTest = activeTest;
  };
  if (flags) {
    this.flags = flags;
  };

  this.runSyncTest();
};