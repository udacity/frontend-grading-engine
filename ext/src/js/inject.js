chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      var metaTag = document.querySelector('meta[name="udacity-grader"]');

      function injectWidgets () {
        // import templates
        var link = document.createElement('link');
        link.rel = 'import';

        link.href = chrome.extension.getURL('src/templates/feedback.html');
        
        // TODO: on-off logic here
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
      function registerTestSuites (json) {
        var newTestSuites = document.createElement('script');
        newTestSuites.innerHTML = 'GE.registerSuites(' + JSON.stringify(json) + ');';
        document.body.appendChild(newTestSuites);
      };

      function loadUnitTests () {
        var unitTests = metaTag.getAttribute('unit-tests');
        if (!unitTests) {
          return;
        }

        var script = document.createElement('script');
        script.src = unitTests;
        document.body.appendChild(script);
      };

      function loadLibraries () {
        var libraries = metaTag.getAttribute('libraries');
        
        if (libraries) {
          libraries = libraries.split(' ');
        } else {
          loadJSONTestsFromFile();
          return;
        }

        var loadedLibs = 0;
        libraries.forEach(function (lib) {
          var script = document.createElement('script');
          script.src = chrome.extension.getURL('src/js/libs/' + lib + '.js');
          script.onload = function () {
            loadedLibs += 1;
            if (loadedLibs === libraries.length) {
              loadJSONTestsFromFile();
            }
          };
          document.body.appendChild(script);
        });
      }

      function loadJSONTestsFromFile () {
        if (metaTag) {
          // http://stackoverflow.com/a/14274828
          var xmlhttp = new XMLHttpRequest();
          xmlhttp.onreadystatechange = function(){
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
              registerTestSuites(xmlhttp.responseText);
              loadUnitTests();
            }
          };
          xmlhttp.open("GET",metaTag.content,true);
          xmlhttp.send();
        }
      }

      function injectGradingEngine() {
        var ge = document.createElement('script');
        ge.src = chrome.extension.getURL('src/js/libs/GE.js');
        document.body.appendChild(ge);

        ge.onload = function (e) {
          // can't load tests until the grading engine has loaded. registerTestSuites() needs GE
          loadLibraries();
        };
      };

      // load tests from browser action
      chrome.runtime.onMessage.addListener(function (message) {
        registerTestSuites(message);
      })
      
      injectWidgets();
      clearInterval(readyStateCheckInterval);
    }
  }, 10);
});