/*global registry, safari, extensionLog */

/**
 * @fileOverview This file contains the adaptee (Adapter inner working) for emulating the WebExtension API.
 * @name adapter.js<background>
 * @author Etienne Prud’homme
 * @license GPLv3
 *
 * Injected Scripts don’t have access to the `chrome.*` API with the exception
 * of:
 * * `extension` (`getURL`, `inIncognitoContext`, `lastError`, `onRequest`,
 *    `sendRequest`)
 * * `i18n`
 * * `runtime` (`connect`, `getManifest`, `getURL`, `id`, `onConnect`,
 *    `onMessage`, `sendMessage`)
 * * `storage`
 *
 * This is wĥy this background script is created.
 */

/**
 * Adaptee that translates chrome method behavior to safari.
 * @namespace
 * @property {error} wrapper.runtime.lastError - Set for the lifetime of a callback if an ansychronous extension api has resulted in an error. If no error has occured lastError will be undefined.
 */
var wrapper = {
  storage: {
    sync: {
      /**
       * Emulates the chrome storage behavior (getter) by using the {@link safari.extension.settings} mechanism.
       * @param {string|string[]|object} keys - A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
       * @todo transform to a Promise
       * @returns {object} Object with items in their key-value mappings.
       * @throws {error} Error in the {@link keys} argument and sets {@link wrapper.runtime.lastError}.
       */
      get: function(keys) {
        var i, len, key, items = {};
        try {
          if(!keys) {
            if(keys === null) {
              items = safari.extension.settings;
            } else {
              // Only `null` can return values, otherwise it’s an empty Object
              items = {};
            }
          } else if(keys instanceof String || typeof keys === 'string') {
            items[keys] = safari.extension.settings[keys];
          } else if(keys instanceof Array && keys.length > 0) {
            items = {};

            for(i=0, len=keys.length; i<len; i++) {
              key = keys[i];
              if(!(key instanceof String || typeof key === 'string')) {
                extensionLog(new Error('An item of the `keys` array wasn’t a String'));
              }
              items[key] = safari.extension.settings[key];
            }
          } else {
            // Otherwise it can be any Objects with properties as keys.
            items = {};
            // Only a coincidence if they got the same names.
            var value, keysArray = Object.keys(keys);

            if(keysArray.length === 0) {
              extensionLog(new Error('The `keys` object does not contain any property on its own'));
            }

            for(i=0, len=keysArray.length; i<len; i++) {
              key = keysArray[i];
              value = safari.extension.settings[key];
              // Return the default value if the key isn’t present in settings
              items[key] = value !== undefined ? value : keys[key];
            }
          }
        } catch(e) {
          wrapper.runtime.lastError = e;
          items = -1;
        }
        return items;
      },
      /**
       * Emulates the chrome storage behavior (setter) by using the {@link safari.extension.settings} mechanism.
       * @param {} keys - An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
       * Primitive values such as numbers will serialize as expected. Values with a typeof `object` and `function` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), Date, and Regex (serialize using their `String` representation).
       * @returns {int} 0 on success and -1 on error.
       * @throws {error} Error in the {@link keys} argument and sets {@link wrapper.runtime.lastError}.
       */
      set: function(keys) {
        try {
          if(!keys || keys instanceof String || typeof keys === 'string' || keys instanceof Array) {
            extensionLog(new Error('The `keys` argument is not a valid Object with keys/properties'));
          }

          var key, i, len, keysArray = Object.keys(keys);

          if(keysArray.length === 0) {
            extensionLog(new Error('The `keys` object does not contain any property on its own'));
          }

          for(i=0, len=keysArray.length; i<len; i++) {
            key = keysArray[i];
            safari.extension.settings[key] = keys[key];
          }
        } catch (e) {
          wrapper.runtime.lastError = e;
          return -1;
        }
        return 0;
      }
    }
  },
  runtime: {
    lastError: null
  },
  tabs: {
    /**
     * Sends a single message to the content script(s) in the specified tab,
     * with an optional callback to run when a response is sent back. The
     * {@link injected.runtime.onMessage} event is fired in each content script
     * running in the specified tab for the current extension.
     * @param {int} tabId - The tab to send the message to.
     * @param {*} message - Any object that can be serialized.
     * @returns {Promise} A promise to be fulfilled when it has been received.
     */
    sendMessage: function(tabId, message, options, channel) {
      try {
        var tab = registry.getTabById(tabId);

        channel = channel || Math.floor(Math.random() * 100000000);
        tab.page.dispatchMessage('injected.runtime.onMessage', JSON.stringify({message: message, channel: channel}));
      } catch(e) {
        return Promise.reject(e.message);
      }
      return new Promise(function(resolve, reject) {
        tab.addEventListener('message', function handler(event) {
          var message = JSON.parse(event.message);
          // The injected script response
          if(event.name === 'injected.runtime.onMessage~response' &&
             parseInt(message.channel) === (0 - channel)) {
            tab.removeEventListener('message', handler, false);
            resolve(message.response);
          }
        }, false);
      });
    },

    /**
     * Gets all tabs that have the specified properties, or all tabs if no
     * properties are specified.
     * @param {object} queryInfo
     * @param {bool} [queryInfo.active] - TODO Whether the tabs are active in
     * their windows. (Does not necessarily mean the window is focused.)
     * @param {bool} [queryInfo.currentWindow] - TODO Whether the tabs are in
     * the /current window/. Note: the current window doesn’t mean it’s the
     * active one. It means that the window is currently executing.
     * @returns {int|Object[]} Result of the query of -1 on error.
     */
    query: function(queryInfo) {
      var windows, tabs;
      try {
        windows = safari.application.browserWindows;
        tabs = [];

        if(Object.prototype.toString.call(queryInfo) === '[object Object]') {
          // queryInfo.currentWindow
          if(queryInfo.currentWindow) {
            /** Because there’s no way I know to select the window currently
             * running in Safari, the active window (or
             * {@link lastFocusedWindow} one if null) will be used instead. If
             * someone successfully thriggers an action page that isn’t focused,
             * it’s an undefined behavior.
             */
            windows = registry.getActiveWindow();
            if(windows === null) {
              windows = registry.getLastFocused();
            }
            // Put it in an array
            windows = [windows];
          }

          // queryInfo.active
          if(queryInfo.active === true) {
            tabs = makeTabType(activeTabs(windows));
          } else {
            tabs = makeTabType(getTabs(windows));
          }
        } else {
          extensionLog(new Error('No valid query is specified'));
        }

        /**
         * Gets all active {@link SafariBrowserTab} from given an array
         * {@link SafariBrowserWindow}.=
         * @param {SafariBrowserWindow[]} windows - Windows to get all active
         * tabs.
         * @returns {SafariBrowserTabs[]} Array of active tabs.
         */
        function activeTabs(windows) {
          var resultTabs = [], index, i, len;

          for(i=0, len=windows.length; i<len; i++) {
            // It makes a copy of the object
            resultTabs.push(windows[i].activeTab);
          }
          return resultTabs;
        }

        /**
         * Gets all tabs from given windows.
         * @param {SafariBrowserWindow[]} windows - An array of
         * {@link SafariBrowserWindow}.
         * @returns {SafariBrowserTab[]} List of tabs from {@link windows}.
         */
        function getTabs(windows) {
          var i, len, u, u_len, windowTabs, index, resultTabs = [];
          for(i=0, len=windows.length; i<len; i++) {
            windowTabs = windows[i].tabs;
            for(u=0, u_len=windowTabs.length; u<u_len; u++) {
              resultTabs.push(windowTabs[u]);
            }
          }
          return resultTabs;
        }

        /**
         * Makes a Tab type.
         * @param {SafariBrowserTab[]} tabs - Array of SafariBowserTab.
         * @returns {Tab[]} Chrome formatted Tab type.
         */
        function makeTabType(tabs){
          var resultTabs = [], i, len, currentTab, tab;

          for(i=0, len=tabs.length; i<len; i++) {
            tab = tabs[i];
            currentTab = {
              id: tab.id
              // All other parts may change
            };
            resultTabs.push(currentTab);
          }
          return resultTabs;
        }
      } catch(e) {
        wrapper.runtime.lastError = e;
        return -1;
      }
      return tabs;
    }
  }
};

// adapter.js<background> ends here
