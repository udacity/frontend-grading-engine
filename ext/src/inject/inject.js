chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      
      function injectWidgets() {
        function supportsImports() {
          return 'import' in document.createElement('link');
        }
        if (supportsImports()) {
          // Cool!
        } else {
          // Use other libraries/require systems to load files.
          alert("You must use the latest version of Google Chrome to get feedback and a code for this quiz. Sorry!");
        }

        // import templates
        var link = document.createElement('link');
        link.rel = 'import';
        link.href = '/frontend-grading-engine/dist/feedback.html';
        document.head.appendChild(link);
        
        link.onload = function(e) {
          console.log('Loaded Udacity feedback widget');
          injectGradingEngine();
        }
        link.onerror = function(e) {
          throw new Error('Failed to load the Udacity Grading Engine. Please reload.');
        }
      };

      // TODO: make sure the grader isn't already on the page
      function injectGradingEngine() {
        var ge = document.createElement('script');
        ge.src = '/frontend-grading-engine/dist/udgrader-004.js';
        document.body.appendChild(ge);

        ge.onload = function (e) {
          var preDefinedTestSuites = document.querySelector('meta[name="udacity-grader"]') || false;
          if (preDefinedTestSuites) {
            var testSuiteDefinitions = document.createElement('script');
            testSuiteDefinitions.src = '/frontend-grading-engine/ext/tests/' + preDefinedTestSuites.content;
            document.body.appendChild(testSuiteDefinitions);
          }
        };
      };

      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        var newTestSuites = document.createElement('script');

        // Yes, this is kind of a hack and I'm ok with that.
        // You don't have access to the GE here, but you can inject a script into the document that does.
        newTestSuites.innerHTML = 'GE.registerSuites(' + JSON.stringify(message) + ')';
        document.body.appendChild(newTestSuites);
      })

      injectWidgets();
    }
  }, 10);
});