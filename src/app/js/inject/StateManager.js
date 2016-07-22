/*global removeFileNameFromPath */

/**
 * @fileoverview This file contains the StateManager Class.
 * @todo Add a warning if the widget fails to initialize.
 */

/**
 * State of the current Document.
 * @returns {Promise}
 * @throws {Error} An error coming from a Promise.
 */
function StateManager() {
  this.whitelist = [];
  this.hostIsAllowed = false;
  // Site is on file://*
  this.isFileProtocol = false;
  this.host = window.location.origin;

  if(this.host === 'null') {
    if(window.location.protocol === 'file:') {
      this.host = removeFileNameFromPath(window.location.pathname);
      this.isFileProtocol = true;
    } else {
      throw new Error('Unknown URL formatting error');
    }
  }

  this.geInjected = false;

  var currentlyInjecting = false;

  /**
   * Run a sequence of Promises to activate the Grading Engine.
   * @returns {Promise}
   * @throws {Error} An error coming from a Promise.
   */
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
      // This is to prevent UnitTests and other things in the page to execute before all tests are registered
        .then(waitForTestRegistrations)
        .then(loadUnitTests)
        .then(function() {
          self.geInjected = true;
          currentlyInjecting = false;
          return Promise.resolve();
        }, function(e) {
          // debugger;
          console.log(e);
          throw new Error('Something went wrong loading Udacity Feedback. Please reload.');
        });
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Checks if the host is allowed to execute the Grading Engine (and arbitrary tests).
   * @returns {Promise}
   */
  this.isSiteOnWhitelist = function() {
    var self = this;
    self.isAllowed = false;
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get('whitelist', function(response) {
        self.whitelist = response.whitelist;
        // console.log(self.whitelist);
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

  /**
   * Adds the current Document host to the whitelist (local storage).
   * @returns {Promise}
   */
  this.addSiteToWhitelist = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var index = self.whitelist.indexOf(self.host);
      if (index === -1) {
        self.whitelist.push(self.host);
      }
      self.isAllowed = true;

      var data = {whitelist: self.whitelist};
      chrome.storage.sync.set(data, function() {
        // debugger;
        resolve();
      });
    });
  };

  /**
   * Removes the current document host from the whitelist (local storage).
   * @param {string} site - unused
   * @returns {Promise}
   */
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
        // debugger;
        resolve();
      });
    });
  };

  /**
   * Getter for {@link isAllowed} property. This property shows if the website is on the whitelist.
   * @returns {boolean} The {@link isAllowed} property.
   }
   */
  this.getIsAllowed = function() {
    return this.isAllowed;
  };

  /**
   * Method that activates the {@link runLoadSequence}.
   * @returns {Promise}
   */
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

  /**
   * Method that desactivates the `test-widget`.
   * @returns {Promise}
   * @throws {it’s cool} do nothing
   */
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
              // it’s cool. do nothing
            }
          }
        });
        injectedElementsOnPage = [];
        // wish I could unregister <test-widget>, but it doesn’t look like it’s possible at the moment
        self.geInjected = false;
      })
      .catch(function(e) {
        throw e;
      });
  };
}

// StateManager.js ends here
