function ActiveTest(rawTest) {
  // will need to validate all of these
  this.description = rawTest.description;
  this.flags = rawTest.flags || {};
  this.id = parseInt(Math.random() * 1000000);
  this.testPassed = false;
  // this.optional = flags.optional;
  this.gradeRunner = function() {};

  // TODO: move this validation stuff out of here
  // validate the description.
  if (typeof description !== 'string') {
    throw new TypeError("Every suite needs a description string.");
  }

  // validate the activeTest
  // if (typeof activeTest !== 'function') {
  //   throw new TypeError("Every suite needs an activeTest function or config.");
  // }

  if (typeof activeTest === 'object') {
    // check methods here?
  }

  // validate the flags
  if (typeof flags !== 'object') {
    throw new TypeError('If assigned, flags must be an object.');
  }

  this.iwant = new TA();

  var self = this;
  this.activeTest = (function (config) {
    var methodsToQueue = [];

    // TODO: parse the config
    var methodsToQueue = self.iwant.translateConfigToMethods(config);

    // TODO!: maybe the mock is unnecessary. Can I move all the scoping and queuing to translateConfigToMethods?

    var taMock = new TAMock(self.iwant);

    var queueUp = function () {
      methodsToQueue.forEach(function (method) {
        // hopefully call the right method on the mock, which should call the eponymous method on this.iwant
        // taMock[method.name](method.arguments);
        // TODO: if scoping works within tCTM, then I should just be able to call each method here instead.
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


// TODO: move this to the sandbox
ActiveTest.prototype.runTest = function () {
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

  // clearInterval(this.gradeRunner);
  this.gradeRunner = setInterval(testRunner, 1000);
};

ActiveTest.prototype.stopTest = function () {
  clearInterval(this.gradeRunner);
};

ActiveTest.prototype.update = function (config) {
  // TODO: need to convert config.activeTest into a function
  var description = config.description || false;
  var activeTest = config.activeTest || false;
  var flags = config.flags || false;

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

  this.runTest();
};