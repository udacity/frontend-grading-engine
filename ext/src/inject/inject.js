chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      
      function injectWidgets() {
        // import templates
        var link = document.createElement('link');
        link.rel = 'import';

        link.href = chrome.extension.getURL('src/templates/feedback.html');
        document.head.appendChild(link);

        link.onload = function(e) {
          console.log('Loaded Udacity feedback widget');
          injectGradingEngine();
        }
        link.onerror = function(e) {
          throw new Error('Failed to load the Udacity Grading Engine. Please reload.');
        }
      };

      // You don't have access to the GE here, but you can inject a script into the document that does.
      function loadTests (json) {
        var newTestSuites = document.createElement('script');
        newTestSuites.innerHTML = 'GE.registerSuites(' + JSON.stringify(json) + ');';
        document.body.appendChild(newTestSuites);
      };

      function injectGradingEngine() {
        var ge = document.createElement('script');
        ge.src = chrome.extension.getURL('src/js/udgrader.js');
        ge.setAttribute('ud-grader', true);
        document.body.appendChild(ge);

        ge.onload = function (e) {
          // can't load tests until the grading engine has loaded. loadTests() needs GE
          var preDefinedTestSuites = document.querySelector('meta[name="udacity-grader"]') || false;
          if (preDefinedTestSuites) {
            // http://stackoverflow.com/a/14274828
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function(){
              if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
                loadTests(xmlhttp.responseText);
              }
            };
            xmlhttp.open("GET",preDefinedTestSuites.content,true);
            xmlhttp.send();
          }
        };
      };

      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        loadTests(message);
      })
      
      injectWidgets();
      clearInterval(readyStateCheckInterval);
    }
  }, 10);
});