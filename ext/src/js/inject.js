chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      /**
       * Adds elements to main page with a promise.
       * @param  {String} tag       Type of element
       * @param  {Object} data      Key/value pairs you want to be assigned to as newTag[key] = value
       * @param  {Object} location  Set to 'head' if you want the element to end up there. Default is body
       * @return {Promise}
       */
      function injectIntoDocument(tag, data, location) {
        location = location || 'body';
        return new Promise(function(resolve, reject) {
          var newTag = document.createElement(tag);
          if (data) {
            for (a in data) {
              newTag[a] = data[a];
            };
          };
          newTag.onload = function (e) {
            resolve(e);
          };
          newTag.onerror = function (e) {
            reject(e);
          };
          if (tag === 'script' && !newTag.src && (newTag.text || newTag.innerHTML)) {
            resolve();
          }
          if (location === 'head') {
            document.head.appendChild(newTag);
          } else {
            document.body.appendChild(newTag);
          };
        });
      };

      // start of load sequence
      var metaTag = document.querySelector('meta[name="udacity-grader"]');
      metaTag ? metaTag = metaTag : metaTag = false;

      function importFeedbackWidget() {
        return injectIntoDocument(
          'link',
          { rel: 'import',
            href: chrome.extension.getURL('src/templates/feedback.html') },
          'head');
      };

      function injectGradingEngine() {
        return injectIntoDocument(
          'script',
          { src: chrome.extension.getURL('src/js/libs/GE.min.js') }
        );
      };

      function loadLibraries() {
        if (metaTag) {
          var libraries = metaTag.getAttribute('libraries');
        }
        
        if (libraries) {
          libraries = libraries.split(' ');
        } else {
          return Promise.resolve();
        }

        var loadedLibs = 0;
        return Promise.all(
          libraries.map(function (lib) {
            return injectIntoDocument(
              'script',
              { src: chrome.extension.getURL('src/js/libs/' + lib + '.js') }
            )
          })
        )
      }

      function loadJSONTestsFromFile() {
        if (metaTag) {
          return new Promise(function(resolve, reject) {
            // http://stackoverflow.com/a/14274828
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
              if (xmlhttp.status == 200 && xmlhttp.readyState == 4){
                resolve(xmlhttp.responseText);
              } else if (xmlhttp.status >= 400) {
                reject(false);
              }
            };
            xmlhttp.open("GET",metaTag.content,true);
            xmlhttp.send();
          });
        } else {
          return Promise.resolve(false);
        }
      }

      // You don't have access to the GE here, but you can inject a script into the document that does.
      function registerTestSuites(json) {
        if (!json) {
          return Promise.resolve();
        }

        var errorMsg = null;
        // validating the JSON
        try {
          if (json.length > 0) {
            JSON.parse(json);
          }
        } catch (e) {
          errorMsg = "Invalid JSON file format.";
        }
        try {
          json = JSON.stringify(json);
        } catch (e) {
          errorMsg = "Invalid JSON format.";
        }

        if (errorMsg) {
          alert(errorMsg);
          throw new Error(errorMsg);
        } else {
          return injectIntoDocument(
            'script',
            { text: 'UdacityFEGradingEngine.registerSuites(' + json + ');' }
          )
        }
      };

      function loadUnitTests() {
        var unitTests = null;
        if (metaTag) {
          unitTests = metaTag.getAttribute('unit-tests');
        }
        if (!unitTests) {
          return Promise.resolve();
        }

        return injectIntoDocument(
          'script',
          { src: unitTests }
        );
      };

      function StateManager() {
        this.whitelist = [];
        this.hostIsAllowed = false;
        this.host = location.hostname;
        this.geInjected = false;
      };

      StateManager.prototype = {
        isSiteOnWhitelist: function() {
          var self = this;
          return new Promise(function (resolve, reject) {
            chrome.storage.sync.get('whitelist', function (response) {
              self.whitelist = response.whitelist;
              if (!(self.whitelist instanceof Array)) {
                self.whitelist = [self.whitelist];
              }
              if (self.whitelist.indexOf(self.host) > -1) {
                self.isAllowed = true;
              } else {
                self.isAllowed = false;
              }
              resolve(self.isAllowed);
            });
          });
        },
        addSiteToWhitelist: function(site) {
          var self = this;
          return new Promise(function (resolve, reject) {
            var index = self.whitelist.indexOf(self.host);
            if (index === -1) {
              self.whitelist.push(self.host);
            }
            self.isAllowed = true;
            var data = {whitelist: self.whitelist};
            chrome.storage.sync.set(data, function () {
              resolve();
            });
          });
        },
        removeSiteFromWhitelist: function(site) {
          var self = this;
          return new Promise(function (resolve, reject) {
            var index = self.whitelist.indexOf(self.host);
            if (index > -1) {
              self.whitelist.splice(index, 1);
            }
            self.isAllowed = false;
            var data = {whitelist: self.whitelist};
            chrome.storage.sync.set(data, function () {
              resolve();
            });
          });
        },
        getIsAllowed: function() {
          return this.isAllowed;
        },
        runLoadSequence: function() {
          var self = this;
          return importFeedbackWidget()
          .then(injectGradingEngine)
          .then(loadLibraries)
          .then(loadJSONTestsFromFile)
          .then(registerTestSuites)
          .then(loadUnitTests)
          .then(function() {
            self.geInjected = true;
            return Promise.resolve();
          }, function(e) {
            console.log(e);
            throw new Error("Something went wrong loading Udacity Feedback. Please reload.");
          })
        },
        turnOn: function() {
          var g = document.querySelector('#ud-grader-options')
          if (g) {
            document.head.removeChild(g);
          }
          return injectIntoDocument(
            'script',
            { id: 'ud-grader-options',
              innerHTML: 'UdacityFEGradingEngine.turnOn();' },
            'head'
          ).then(function() {
            Promise.resolve(true);
          })
        },
        turnOff: function() {
          var g = document.querySelector('#ud-grader-options')
          if (g) {
            document.head.removeChild(g);
          }
          return injectIntoDocument(
            'script',
            { id: 'ud-grader-options',
              innerHTML: 'UdacityFEGradingEngine.turnOff();' },
            'head'
          ).then(function() {
            Promise.resolve(false);
          })
        }
      };

      var stateManager = new StateManager();

      stateManager.isSiteOnWhitelist()
      .then(stateManager.runLoadSequence);

      // wait for messages from browser action
      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.type) {
          case 'json':
            registerTestSuites(message.data);
            break;
          case 'on-off':
            if (message.data === 'on') {
              stateManager.addSiteToWhitelist()
              .then(stateManager.turnOn)
            } else if (message.data === 'off') {
              stateManager.removeSiteFromWhitelist()
              .then(stateManager.turnOff);
            }
            break;
          case 'background-wake':
            sendResponse(stateManager.getIsAllowed());
            break;
          default:
            console.log('invalid message type for: %s from %s', message, sender)
            break;
        }
      });

      // for first load
      window.addEventListener('GE-on', function () {
        if (stateManager.isAllowed) {
          stateManager.turnOn();
        }
      })
    }
  }, 100);
});