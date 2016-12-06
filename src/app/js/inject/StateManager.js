/*global removeFileNameFromPath, importFeedbackWidget, injectGradingEngine, loadLibraries, loadJSONTestsFromFile, registerTestSuites, waitForTestRegistrations, loadUnitTests, chrome, injectIntoDocument, importComponentsLibrary, removeInjectedFromDocument, removeFromDocument, turnOnGA, promptFileInput */

/**
 * @fileOverview This file contains the StateManager Class.
 * @name StateManager.js<inject>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 * @todo Add a warning if the widget fails to initialize.
 */

var warningCodes = {
  'components_already_loaded_exception': 'The components library is already loaded',
  'error_loading_library_exception': 'A required library couldn’t be loaded',
  'file_input_already_pending_exception': 'Already waiting for the file input',
  'grading_engine_already_loaded_exception': 'The Grading Engine library is already loaded',
  'http_error_code_exception': 'The test file request returned an HTTP error',
  'invalid_json_exception': 'Invalid JSON file format',
  'no_json_data_provided_exception': '',
  'no_library_specified_exception': '',
  'no_meta_tag_exception': 'This website doesn’t seem to contain a link to the test file. Please load it manually.',
  'no_unit_tests_exception': '',
  'redirection_exception': 'The test file request received a redirection. Possible cross-origin request attempt',
  'regex_escape_characters_exception': 'Are you trying to use “\\” in a RegEx? Try using \\\\ instead',
  'unknown_location_type_exception': 'Assertion failed: Unknown location type',
  'widget_already_loaded_exception': 'The Feedback Widget is already loaded',
  'wrong_filetype_exception': 'The prompt doesn’t support the asked filetype'
};

/**
 * State of the current Document.
 * @returns {Promise}
 * @throws {Error} An error coming from a Promise.
 */
function StateManager() {
  /**
   * This variable stores private variables that shouldn’t be changed
   * outside of the {@link StateManager}.
   */
  var protected = {
    host: window.location.origin,
    isAllowed: false,
    type: null
  };
  var currentlyInjecting = false;

  this.whitelist = {remote: [], local: []};
  this.gradingEngineInjected = false;

  Object.defineProperties(this, {
    hasLocalFileAccess: {
      configurable: false,
      enumerable: false,
      value: window.navigator.vendor.toLocaleLowerCase().indexOf('google') === -1,
      writable: false
    },
    host: {
      get: function() {
        return protected.host;
      }
      // No setters
    },
    isAllowed: {
      get: function() {
        return protected.isAllowed;
      }
      // No setters
    },
    type: {
      get: function() {
        return protected.type;
      }
      // No setters
    }
  });

  if(this.host.search(/^(?:https?:)\/\/[^\s\.]/) !== -1)
  {
    protected.type = 'remote';
  } else if(this.host === 'null' || this.host.search('file://') !== -1) {
    if(window.location.protocol === 'file:') {
      if(this.hasLocalFileAccess) {
        protected.host = removeFileNameFromPath(window.location.pathname);
      } else {
        protected.host = location.href.substring(7, location.href.lastIndexOf('/') + 1);
      }

      protected.type = 'local';
    } else {
      throw new Error('Unknown URL formatting error');
    }
  } else {
    throw new Error('Unknown URL formatting error');
  }

  /**
   * Run a sequence of Promises to activate the Grading Engine.
   * @returns {Promise}
   * @throws {Error} An error coming from a Promise.
   */
  function runLoadSequence() {
    var self = this;

    if (!currentlyInjecting && !self.gradingEngineInjected) {
      currentlyInjecting = true;

      return importComponentsLibrary()
        .then(importFeedbackWidget)
        .then(injectGradingEngine)
        .then(loadJSONTestsFromFile)
        .catch(function(error){
          switch(error) {
          case 'chrome_local_exception':
            return turnOnGA().then(function(value) {
              /**
               * Passes the captured status from the {@link Promise} returned
               * by {@link loadJSONTestsFromFile}.
               */
              promptFileInput(value);
              // We’ve executed the non-fatal recovery. Everything else should
              // not be executed.
              return Promise.reject(value);
            });
            break;
          case 'no_meta_tag_exception':
            return turnOnGA().then(function(value) {
              /**
               * Passes the captured status from the {@link Promise} returned
               * by {@link loadJSONTestsFromFile}.
               */
              promptFileInput(value);
            });
            break;
          default:
            return Promise.reject(error);
          }
        })
        .then(registerTestSuites)
        .then(loadLibraries)
        .then(turnOnGA)
      // This is to prevent UnitTests and other things in the page to execute
      // before all tests are registered
        .then(waitForTestRegistrations)
        .then(loadUnitTests)
        .then(function() {
          self.gradingEngineInjected = true;
          currentlyInjecting = false;
        }).catch(function(error) {
          // Do nothing
          console.log(error);
        });
    } else {
      return Promise.reject('grading_engine_already_loaded_exception');
    }
  }

  /**
   * Checks if the host is allowed to execute the Grading Engine (and arbitrary
   * tests).
   * @returns {Promise}
   */
  this.isSiteOnWhitelist = function() {
    var self = this;
    var type = self.type;
    var allowed = false;
    var voidList = {remote: [], local: []};

    return new Promise(function(resolve) {
      chrome.storage.sync.get('whitelist', function(response) {
        self.whitelist = response.whitelist || voidList;

        if (!(self.whitelist[type] instanceof Array)) {
          self.whitelist[type] = [self.whitelist[type]];
        }
        allowed = self.whitelist[type].indexOf(self.host) > -1;

        if(allowed) {
          self.allowSite();
        }
        return resolve(allowed);
      });
    });
  };

  /**
   * Temporary allow the extension to execute in a website. It will
   * automatically be discarded after refresh.
   * @returns {Promise}
   */
  this.allowSite = function() {
    var self = this;
    var type = self.type;

    if(!type) {
      return Promise.reject('unknown_location_type_exception');
    }

    protected.isAllowed = true;
    return Promise.resolve();
  };

  /**
   * Disallow the extension to execute in a website.
   * @returns {Promise}
   */
  this.disallowSite = function() {
    var self = this;
    var type = self.type;

    if(!type) {
      return Promise.reject('unknown_location_type_exception');
    }

    protected.isAllowed = false;
    return Promise.resolve();
  };

  /**
   * Adds the current Document host to the whitelist (local storage).
   * @returns {Promise}
   */
  this.addSiteToWhitelist = function() {
    var self = this;
    var type = self.type;
    var index;
    var data;

    if(!type) {
      return Promise.reject('unknown_location_type_exception');
    }

    index = self.whitelist[type].indexOf(self.host);

    if (index === -1) {
      self.whitelist[type].push(self.host);
    }
    self.allowSite();

    data = {whitelist: self.whitelist};
    return chrome.storage.sync.set(data, function() {
      return Promise.resolve({
        satus: 0
      });
    });
  };

  /**
   * Removes the current document host from the whitelist (local
   * storage).
   * @param {string} site - unused
   * @returns {Promise}
   */
  this.removeSiteFromWhitelist = function(site) {
    var self = this;
    var type = self.type;
    var _site = site || self.host;
    var index = self.whitelist[type].indexOf(_site);
    var data;

    if (index > -1) {
      self.whitelist[type].splice(index, 1);
    }
    data = {whitelist: self.whitelist};

    return new Promise(function(resolve) {
      chrome.storage.sync.set(data, function() {
        resolve({
          status: 0
        });
      });
    });
  };

  /**
   * Getter for {@link isAllowed} property. This property shows if the website
   * is on the whitelist.
   * @returns {boolean} The {@link isAllowed} property.
   }
  */
  this.getIsAllowed = function() {
    var self = this;
    var isAllowed = (protected.isAllowed === true);

    if(!self.hasLocalFileAccess && self.type === 'local') {
      return Promise.reject({
        status: 'chrome_local_exception',
        message: isAllowed
      });
    }

    return Promise.resolve(isAllowed);
  };

  /**
   * Method that activates the {@link runLoadSequence}.
   * @returns {Promise}
   */
  this.turnOn = function() {
    var self = this;

    // What’s that?
    var g = document.querySelector('#ud-grader-options');

    if (g) {
      document.head.removeChild(g);
    }

    if (!self.gradingEngineInjected) {
      return runLoadSequence().then(function() {
        return Promise.resolve({
          status: 0
        });
      });
    } else {
      // The GradingEngine is already injected
      return Promise.reject({
        status: 'already_injected_exception',
        message: 'Cannot inject the Grading Engine since it’s already injected'
      });
    }
  };

  /**
   * Method that desactivates the `test-widget`.
   * @returns {Promise}
   * @throws {it’s cool} do nothing
   */
  this.turnOff = function() {
    var self = this;

    removeFromDocument('ud-grader-options');

    return injectIntoDocument('script', {
      id: 'ud-grader-options',
      // Reviewer: This is safe to pass.
      innerHTML: 'UdacityFEGradingEngine.turnOff();' +
        'delete window.UdacityFEGradingEngine;' +
        'window.addEventListener("killUdacityFEGradingEngine", function handler() {' +
        '  window.removeEventListener("killUdacityFEGradingEngine", handler, false);' +
        '  window.dispatchEvent(new Event("killedGradingEngine"));' +
        '}, false);'
    }, 'head')
      .then(function() {
        return new Promise(function(resolve) {
          window.addEventListener('killedGradingEngine', function handler() {
            window.removeEventListener('killedGradingEngine', handler, false);
            resolve();
          }, false);
          window.dispatchEvent(new Event('killUdacityFEGradingEngine'));
        });
      })
      .then(function() {
        removeInjectedFromDocument();
        // wish I could unregister <test-widget>, but it doesn’t look like it’s
        // possible at the moment
        self.gradingEngineInjected = false;
      })
      .catch(function(e) {
        throw e;
      });
  };
}

// StateManager.js<inject> ends here
