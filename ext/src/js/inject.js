chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // start of load sequence

      var metaTag = document.querySelector('meta[name="udacity-grader"]');

      function injectWidgets () {
        // import templates
        var link = document.createElement('link');
        link.rel = 'import';

        link.href = chrome.extension.getURL('src/templates/feedback.html');
        
        document.head.appendChild(link);

        link.onload = function(e) {
          injectGradingEngine();
        }
        link.onerror = function(e) {
          throw new Error('Failed to load the Udacity Grading Engine. Please reload.');
        }
      };

      function injectGradingEngine() {
        var ge = document.createElement('script');
        ge.src = chrome.extension.getURL('src/js/libs/GE.min.js');
        document.body.appendChild(ge);

        ge.onload = function (e) {
          // can't load tests until the grading engine has loaded. registerTestSuites() needs GE
          loadLibraries();
        };
      };

      function loadLibraries () {
        // TODO: make sure that metaTag exists first!
        if (metaTag) {
          var libraries = metaTag.getAttribute('libraries');
        }
        
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
              loadJSONTestsFromFile(isAllowed);
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

      // You don't have access to the GE here, but you can inject a script into the document that does.
      function registerTestSuites (json) {
        var newTestSuites = document.createElement('script');
        
        // validating the JSON
        try {
          if (json.length > 0) {
            JSON.parse(json);
          }
        } catch (e) {
          alert("Illegal file format. Udacity grader expects JSON files.");
          throw new Error("Invalid file format.");
        }

        try {
          json = JSON.stringify(json);
          newTestSuites.innerHTML = 'UdacityFEGradingEngine.registerSuites(' + json + ');';
        } catch (e) {
          throw new Error("Invalid JSON format.")
        }
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

      // end of load sequence


      // syncing with chrome extension storage to determine if extension is allowed to run
      var whitelistedSites = [];
      var isAllowed = false;
      var checkedState = false;

      function syncWithWhitelist(site, value, callback) {
        var index = whitelistedSites.indexOf(site);
        if (value === 'off') {
          if (index > -1) {
            whitelistedSites.splice(index, 1);
          }
        } else if (value === 'on') {
          if (index === -1) {
            whitelistedSites.push(site);
          }
        }
        var data = {whitelist: whitelistedSites};

        chrome.storage.sync.set(data, function () {
          if (callback) {
            callback(true);
          }
        });
      };

      function getSyncData (callback) {
        chrome.storage.sync.get(null, function (response) {
          if (callback) {
            callback(response);
          }
        });
      };

      function whitelistSite (callback) {
        var thisHost = location.hostname;
        syncWithWhitelist(thisHost.toString(), 'on', function() {
          isAllowed = true;
        });
      };

      function blacklistSite (callback) {
        var thisHost = location.hostname;
        syncWithWhitelist(thisHost.toString(), 'off', function () {
          isAllowed = false;
        });
      };

      function checkCurrentHostIsAllowed (callback) {
        var thisHost = location.hostname.toString();
        if (checkedState && callback) {
          callback(isAllowed);
        }
        getSyncData(function (response) {
          if (response.whitelist) {
            whitelistedSites = response.whitelist;
          }

          if (whitelistedSites.indexOf(thisHost) > -1) {
            isAllowed = true;
          } else {
            isAllowed = false;
          }

          if (callback) {
            callback(isAllowed);
          }
          if (!checkedState) {
            checkedState = true;
          }
        });
      };

      function turnOn () {
        var g = document.querySelector('#ud-grader-options')
        if (g) {
          document.head.removeChild(g);
        }
        var geOptionsScript = document.createElement('script');
        geOptionsScript.id = 'ud-grader-options';
        geOptionsScript.innerHTML = 'UdacityFEGradingEngine.turnOn();';
        document.head.appendChild(geOptionsScript);
      };

      function turnOff () {
        var g = document.querySelector('#ud-grader-options')
        if (g) {
          document.head.removeChild(g);
        }
        var geOptionsScript = document.createElement('script');
        geOptionsScript.id = 'ud-grader-options';
        geOptionsScript.innerHTML = 'UdacityFEGradingEngine.turnOff();';
        document.head.appendChild(geOptionsScript);
      };

      // wait for messages from browser action
      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.type) {
          case 'json':
            registerTestSuites(message.data);
            break;
          case 'on-off':
            if (message.data === 'on') {
              whitelistSite();
              turnOn();
            } else if (message.data === 'off') {
              blacklistSite();
              turnOff();
            }
            break;
          case 'background-wake':
            checkCurrentHostIsAllowed(function () {
              sendResponse(isAllowed);
            });
            break;
          default:
            console.log('invalid message type for: %s from %s', message, sender)
            break;
        }
      });

      window.addEventListener('GE-on', function () {
        if (isAllowed) {
          turnOn();
        }
      })

      checkCurrentHostIsAllowed(function () {
        injectWidgets();
      });
      clearInterval(readyStateCheckInterval);
    }
  }, 10);
});