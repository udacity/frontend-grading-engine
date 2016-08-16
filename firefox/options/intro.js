/*global chrome, browser */

/**
 * @fileOverview This file contains the Firefox opening statements for the options page script prepended to the main file.
 * @name intro.js<options>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

var browserName = 'Firefox';

chrome = browser;
chrome.storage = {
  sync: {
    /**
     * Gets one or more items from storage.
     * @param {string|string[]|object} [keys] - A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage
     * @param {function} callback - Callback with storage items, or on failure (in which case runtime.lastError will be set).
     * @returns {}
     */
    get: function(keys, callback) {
      // debugger;
      // console.log(callback);
      // console.log(callback.toString());
      var message = {};
      message.data = keys;
      message.type = 'chrome.storage.local.get';

      chrome.runtime.sendMessage(null, message, {}, localHandleGet);

      function localHandleGet(response) {
        // debugger;
        // console.log('localHandleGet');
        callback(response);
      }
    },
    set: function(object, callback) {
      // debugger;
      // console.log("chrome.storage.sync.set object = ", object);
      var message = {};

      message.type = 'chrome.storage.local.set';
      message.data = object;
      chrome.runtime.sendMessage(null, message, {}, localHandleSet);
      function localHandleSet(response) {
        // debugger;
        // console.log('localHandleSet');
        if(response.status) {
          throw new Error('Error: ' + response.message);
        }
        callback();
      }
    }
  }
};

// intro.js<options> ends here
