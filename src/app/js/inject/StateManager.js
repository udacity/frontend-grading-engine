/**
 * @fileoverview This file contains the StateManager Class.
 */

chrome.storage = {
  sync: {
    /**
     * Gets one or more items from storage.
     * @param {string|string[]|object} [keys] - A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage
     * @param {function} callback - Callback with storage items, or on failure (in which case runtime.lastError will be set).
     * @returns {}
     */
    get: function(keys, callback) {
      debugger;
      console.log(callback);
      console.log(callback.toString());
      var message = {};
      message.data = keys;
      message.type = 'chrome.storage.local.get';

      chrome.runtime.sendMessage(null, message, {}, localHandleGet);

      function localHandleGet(response) {
        debugger;
        console.log('localHandleGet');
        callback(response);
      }
    },
    set: function(object, callback) {
      debugger;
      console.log("chrome.storage.sync.set object = ", object);
      var message = {};

      message.type = 'chrome.storage.local.set';
      message.data = object;
      chrome.runtime.sendMessage(null, message, {}, localHandleSet);
      function localHandleSet(response) {
        debugger;
        console.log('localHandleSet');
        if(response.status) {
          throw new Error('Error: ' + response.message);
        }
        callback();
      }
    }
  }
};

/**
 * State of the current Document.
 * @returns {Promise}
 * @throws {Error} An error coming from a Promise.
 */
function StateManager() {
  this.whitelist = [];
  this.hostIsAllowed = false;
  this.host = location.hostname;
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
        console.log(self.whitelist);
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
   * @param {string} site - unused
   * @returns {Promise}
   */
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
        debugger;
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
        debugger;
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
