/*
start tracking suites and tests here now?
*/

function injectGradingEngine() {
  var ge = document.createElement('script');
  ge.src = '/frontend-grading-engine/dist/udgrader-003.js';
  document.body.appendChild(ge);

  ge.onload = function (e) {
    var definedTests = document.querySelector('meta[name="udacity-grader"]').content;
    if (definedTests !== '') {
      var tests = document.createElement('script');
      tests.src = '/frontend-grading-engine/ext/tests/' + definedTests;
      document.body.appendChild(tests);
    }
  };
};

function Suite(rawSuite) {
  var name = rawSuite.name || "";
  var code = rawSuite.code || '';
  var tests = rawSuite.tests || [];
  var id = parseInt(Math.random() * 1000000);

  // TODO: tests to make sure everything is in the right format and exists!!!

  this.name = name;
  this.code = code;
  this.tests = tests;
  this.id = id;
};

Suite.prototype.registerTest = function (rawTest) {
  var test = new Test(rawTest);
  this.tests.push(test);
};

function Test(rawTest) {
  var description = rawTest.description || "";
  var active_test = rawTest.active_test || function(){};
  var flags = rawTest.flags || [];
  var id = parseInt(Math.random() * 1000000);

  // TODO: tests to make sure everything is in the right format and exists!!!

  this.description = description;
  this.active_test = active_test;
  this.flags = flags;
  this.id = id;
};

var activeTestObserver = {
  suites: [],
  hasSuite: function (suite) {
    // this is about to be broken
    // var inSuites = false;
    // (this.suites.indexOf(suite) > -1) ? inSuites = true : inSuites = false;
    // return inSuites;
  },
  registerTest: function (suite, test) {
    suite.tests.push(test);
  },
  registerSuite: function (suite) {
    this.suites.push(suite);
  }
};

chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      injectGradingEngine();
    }
  }, 10);
});