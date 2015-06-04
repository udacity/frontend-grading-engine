// chrome.extension.sendMessage({test: 'test message'}, function(response) {
// 	var readyStateCheckInterval = setInterval(function() {
// 	if (document.readyState === "complete") {
// 		clearInterval(readyStateCheckInterval);

// 		// ----------------------------------------------------------
// 		// This part of the script triggers when page is done loading
// 		console.log("Hello. This message was sent from scripts/inject.js");
// 		// ----------------------------------------------------------
//     console.log(response)
// 	}
// 	}, 10);
// });
// console.log('injected a script!')


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

chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      injectGradingEngine();
    }
  }, 10);
});