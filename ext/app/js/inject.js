chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);

      var injectedElementsOnPage = [];
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
            }
          }

          if (!newTag.id) {
            newTag.id = 'ud-' + Math.floor(Math.random() * 100000000).toString();
          }
          // for later removal
          injectedElementsOnPage.push(newTag.id);

          newTag.onload = function(e) {
            resolve(e);
          };
          newTag.onerror = function(e) {
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
      }

      // start of load sequence
      var metaTag = document.querySelector('meta[name="udacity-grader"]');
      metaTag ? metaTag = metaTag : metaTag = false;

      function importFeedbackWidget() {
        var twLink = document.querySelector('link#udacity-test-widget');

        if (!twLink) {
          return injectIntoDocument('link', {
            rel: 'import',
            href: chrome.extension.getURL('app/templates/feedback.html'),
            id: 'udacity-test-widget'
          }, 'head');
        } else {
          return Promise.resolve();
        }
      }

      function injectGradingEngine() {
        return injectIntoDocument('script', {
          src: chrome.extension.getURL('app/js/libs/GE.js'),
          id: 'udacity-front-end-feedback'
        });
      }

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
          libraries.map(function(lib) {
            return injectIntoDocument('script', {src: chrome.extension.getURL('app/js/libs/' + lib + '.js')});
          })
        );
      }

      function loadJSONTestsFromFile() {
        if (metaTag) {
          return new Promise(function(resolve, reject) {
            // http://stackoverflow.com/a/14274828
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
              if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                resolve(xmlhttp.responseText);
              } else if (xmlhttp.status >= 400) {
                reject(false);
              }
            };
            xmlhttp.open('GET', metaTag.content, true);
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
          if (json.indexOf('\\') > -1) {
            errorMsg = 'Are you trying to use \'\\\' in a RegEx? Try using \\\\ instead.';
          } else {
            errorMsg = 'Invalid JSON file format.';
          }
        }
        try {
          json = JSON.stringify(json);
        } catch (e) {
          errorMsg = 'Invalid JSON format.';
        }

        if (errorMsg) {
          alert(errorMsg);
          throw new Error(errorMsg);
        } else {
          return injectIntoDocument('script', {text: 'UdacityFEGradingEngine.registerSuites(' + json + ');'});
        }
      }

      function loadUnitTests() {
        var unitTests = null;
        if (metaTag) {
          unitTests = metaTag.getAttribute('unit-tests');
        }
        if (!unitTests) {
          return Promise.resolve();
        }

        return injectIntoDocument('script', {src: unitTests});
      }

      function turnOn() {
        return injectIntoDocument('script', {
          id: 'ud-grader-options',
          innerHTML: 'UdacityFEGradingEngine.turnOn();'
        }, 'head');
      }

      function StateManager() {
        this.whitelist = [];
        this.hostIsAllowed = false;
        this.host = location.hostname;
        this.geInjected = false;

        var currentlyInjecting = false;
        function runLoadSequence() {
          var self = this;
          if (!currentlyInjecting || self.geInjected) {
            currentlyInjecting = true;
            return importFeedbackWidget()
            .then(injectGradingEngine)
            .then(loadLibraries)
            .then(loadJSONTestsFromFile)
            .then(registerTestSuites)
            .then(turnOn)
            .then(loadUnitTests)
            .then(function() {
              self.geInjected = true;
              currentlyInjecting = false;
              return Promise.resolve();
            }, function(e) {
              console.log(e);
              throw new Error('Something went wrong loading Udacity Feedback. Please reload.');
            });
          } else {
            return Promise.resolve();
          }
        }

        this.isSiteOnWhitelist = function() {
          var self = this;
          return new Promise(function(resolve, reject) {
            chrome.storage.sync.get('whitelist', function(response) {
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
        };

        this.addSiteToWhitelist = function(site) {
          var self = this;
          return new Promise(function(resolve, reject) {
            var index = self.whitelist.indexOf(self.host);
            if (index === -1) {
              self.whitelist.push(self.host);
            }
            self.isAllowed = true;
            var data = {whitelist: self.whitelist};
            chrome.storage.sync.set(data, function() {
              resolve();
            });
          });
        };

        this.removeSiteFromWhitelist = function(site) {
          var self = this;
          return new Promise(function(resolve, reject) {
            var index = self.whitelist.indexOf(self.host);
            if (index > -1) {
              self.whitelist.splice(index, 1);
            }
            self.isAllowed = false;
            var data = {whitelist: self.whitelist};
            chrome.storage.sync.set(data, function() {
              resolve();
            });
          });
        };

        this.getIsAllowed = function() {
          return this.isAllowed;
        };

        this.turnOn = function() {
          var self = this;
          var g = document.querySelector('#ud-grader-options');
          if (g) {
            document.head.removeChild(g);
          }
          if (!self.geInjected) {
            return runLoadSequence().then(function() {
              Promise.resolve(true);
            });
          } else {
            return Promise.resolve(true);
          }
        };

        this.turnOff = function() {
          var g = document.querySelector('#ud-grader-options');
          if (g) {
            document.head.removeChild(g);
          }
          return injectIntoDocument('script', {
            id: 'ud-grader-options',
            innerHTML: 'UdacityFEGradingEngine.turnOff();delete window.UdacityFEGradingEngine;'
          }, 'head')
          .then(function() {
            injectedElementsOnPage.forEach(function(id) {
              var e = document.querySelector('#' + id);
              if (e) {
                try {
                  document.body.removeChild(e);
                  document.head.removeChild(e);
                } catch (e) {
                  // it's cool. do nothing
                }
              }
            });
            injectedElementsOnPage = [];
            // wish I could unregister <test-widget>, but it doesn't look like it's possible at the moment
            self.geInjected = false;
          })
          .catch(function(e) {
            throw e;
          });
        };
      }

      var stateManager = new StateManager();

      stateManager.isSiteOnWhitelist()
      .then(function(isAllowed) {
        if (isAllowed) {
          stateManager.turnOn();
        }
      });

      // wait for messages from browser action
      chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        switch (message.type) {
          case 'json':
            registerTestSuites(message.data);
            break;
          case 'on-off':
            if (message.data === 'on') {
              stateManager.addSiteToWhitelist()
              .then(stateManager.turnOn);
            } else if (message.data === 'off') {
              stateManager.removeSiteFromWhitelist()
              .then(stateManager.turnOff);
            }
            break;
          case 'background-wake':
            sendResponse(stateManager.getIsAllowed());
            break;
          default:
            console.log('invalid message type for: %s from %s', message, sender);
            break;
        }
      });

      // for first load
      window.addEventListener('GE-on', function() {
        if (stateManager.isAllowed) {
          stateManager.turnOn();
        }
      });
    }
  }, 100);
});
