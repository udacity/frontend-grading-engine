/*global removeFileNameFromPath, importFeedbackWidget, injectGradingEngine, loadLibraries, loadJSONTestsFromFile, registerTestSuites, turnOn, waitForTestRegistrations, loadUnitTests, chrome, injectedElementsOnPage, injectIntoDocument, importComponentsLibrary, removeInjectedFromDocument, removeFromDocument */

/**
 * @fileOverview This file contains the StateManager Class.
 * @name StateManager.js<inject>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 * @todo Add a warning if the widget fails to initialize.
 */

/**
 * State of the current Document.
 * @returns {Promise}
 * @throws {Error} An error coming from a Promise.
 */
function StateManager() {
  this.whitelist = {remote: [], local: []};
  this.hostIsAllowed = false;
  this.host = window.location.origin;
  this.isChromium = window.navigator.vendor.toLocaleLowerCase().indexOf('google') !== -1;

  if(this.host.search(/^(?:https?:)\/\/[^\s\.]/) !== -1)
  {
    this.type = 'remote';
  } else if(this.host === 'null' || this.host.search('file://') !== -1) {
    if(window.location.protocol === 'file:') {
      this.host = removeFileNameFromPath(window.location.pathname);
      this.type = 'local';
    } else {
      throw new Error('Unknown URL formatting error');
    }
  } else {
    throw new Error('Unknown URL formatting error');
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
      return importComponentsLibrary()
        .then(importFeedbackWidget())
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
      var type = self.type;
      chrome.storage.sync.get('whitelist', function(response) {
        self.whitelist = response.whitelist || {remote: [], local: []};
        // console.log(self.whitelist);
        if (!(self.whitelist[type] instanceof Array)) {
          self.whitelist[type] = [self.whitelist[type]];
        }
        if (self.whitelist[type].indexOf(self.host) > -1) {
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
      var type = self.type;
      if(!type) {
        reject();
      }
      var index = self.whitelist[type].indexOf(self.host);
      if (index === -1) {
        self.whitelist[type].push(self.host);
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
      var type = self.type;
      var index = self.whitelist[type].indexOf(self.host);
      if (index > -1) {
        self.whitelist[type].splice(index, 1);
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
    if(this.isChromium && this.type === 'local') {
      return 'chrome_local_exception';
    }
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
        return new Promise(function(resolve, reject) {
          window.addEventListener('killedGradingEngine', function handler() {
            window.removeEventListener('killedGradingEngine', handler, false);
            resolve();
          }, false);
          window.dispatchEvent(new Event('killUdacityFEGradingEngine'));
        });
      })
      .then(function() {
        removeInjectedFromDocument();
        // wish I could unregister <test-widget>, but it doesn’t look like it’s possible at the moment
        self.geInjected = false;
      })
      .catch(function(e) {
        throw e;
      });
  };
}

// StateManager.js<inject> ends here
