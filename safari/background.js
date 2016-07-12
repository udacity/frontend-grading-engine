/*global safari */

/**
 * @fileOverview This file adds Safari support for those APIs:
 * TODO
 * @name background.js<safari>
 * @author Etienne Prud’homme
 * @license MIT
 * Note:
 * Injected Scripts don’t have access to the `chrome.*` API with the exception of:
 * * `extension` (`getURL`, `inIncognitoContext`, `lastError`, `onRequest`, `sendRequest`)
 * * `i18n`
 * * `runtime` (`connect`, `getManifest`, `getURL`, `id`, `onConnect`, `onMessage`, `sendMessage`)
 * * `storage`
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
       * @returns {object} Object with items in their key-value mappings.
       * @throws {error} Error in the {@link keys} argument and sets {@link wrapper.runtime.lastError}.
       */
      get: function(keys) {
        var items = {};
        try {
          if(!keys) {
            if(keys === null) {
              items = safari.extension.settings;
            } else {
              // Only `null` can return values, otherwise it’s an empty Object
              items = {};
            }
          } else if(keys instanceof String) {
            items[keys] = safari.extension[keys];
          } else if(keys instanceof Array && keys.length > 0) {
            items = {};

            for(var i=0, len=keys.length; i<len; i++) {
              if(!(keys instanceof String)) {
                throw Error('An item of the `keys` array wasn’t a String');
              }
              items[keys[i]] = safari.extension.settings[keys[i]];
            }
          } else {
            // Otherwise it can be any Objects.
            items = {};
            // Only a coincidence if they got the same names.
            var keysArray = Object.keys(keys),
                key = '',
                value = '';

            if(keysArray.length === 0) {
              throw new Error('The `keys` object does not contain any property on its own');
            }

            for(i=0, len=keysArray.length; i<len; i++) {
              key = keysArrays[i];
              value = safari.extension.settings[key];
              // Return the default value if the key isn’t present in settings
              items[key] = value !== undefined ? value : keys[key];
            }
          }
        } catch(e) {
          this.runtime.lastError = e;
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
          if(!keys || keys instanceof String || keys instanceof Array) {
            throw new Error('The `keys` argument is not a valid Object with keys/properties');
          }

          var keysArray = Object.keys(keys),
              key = '',
              value = '';

          if(keysArray.length === 0) {
            throw new Error('The `keys` object does not contain any property on its own');
          }

          for(i=0, len=keys.length; i<len; i++) {
            safari.extension.settings[key] = keys[key];
          }
        } catch (e) {
          this.runtime.lastError = e;
          return -1;
        }
        return 0;
      }
    }
  },
  runtime: {
    lastError: undefined
  },
  tabs: {
    /**
     * @param {int} tabId - The tab to send the message to.
     * @param {*} message - Any object that can be serialized.
     * @todo @param {object} [options]
     * @todo @param {int} [options.frameId] - Send a message to a specific frame identified by {@link frameId} instead of all frames in the tab.
     */
    sendMessage: function(tabId, message, options) {

    },
    /**
     * Gets all tabs that have the specified properties, or all tabs if no properties are specified.
     * @param {object} queryInfo
     * @param {bool} [queryInfo.active] - TODO Whether the tabs are active in their windows. (Does not necessarily mean the window is focused.)
     * @param {bool} [queryInfo.currentWindow] - TODO Whether the tabs are in the /current window/.
     * @todo param {string} tabId - The tab to return
     */
    query: function(queryInfo) {
      try {
        var validQuery = false;
        var windows = safari.application.browserWindows;

        // queryInfo.currentWindow
        if(queryInfo.currentWindow) {
          windows = currentWindow();
          validQuery = true;
        }

        // queryInfo.active
        if(queryInfo.active === true) {
          windows = activeTabs(windows);
          validQuery = true;
        }

        if(!validQuery) {
          throw new Error('No valid query is specified');
        }

        return windows;
        function currentWindow() {
          return safari.application.activeBrowserWindow;
        }

        function activeTabs(windows) {
          var resultTabs = [];

          for(var i=0, len=windows.length; i<len; i++) {
            resultTabs.push(windows[i].activeTab);
          }
        }
      } catch(e) {
        this.runtime.lastError = e;
        return -1;
      }
      return resultTabs;
    }
  }
};

/**
 * Search for {@link SafariBrowserTab} without an id and set a new random unique id.
 * @returns {SafariBrowserWindow[]} Current available windows.
 */
function registerWindows() {
  var windows = safari.application.browserWindows;

  for(var i=0, len=windows.length; i<len; i++) {
    if(windows[i].id === undefined) {
      windows[i].id = uniqueWindowId(windows);
    }
  }

  // Since its lifetime is for a callback
  wrapper.runtime.lastError = undefined;
}, false);

var registry = (function() {
  var _windows = {};
  var _tabs = {};
  var exports = {};

  exports.getWindows = function() {
    return _windows;
  };

  exports.getTabs = function() {
    return _tabs;
  };

  // Windows
  /**
   * Returns a random window ID that isn’t found in the windows array.
   * @param {SafariBrowserWindow[]} windows - An array of windows.
   * @returns {string} Unique identifier with `window-` prefix.
   */
  function getUniqueWindowId(_windows) {
    var id;
    do {
      id = 'window-' + Math.random() * 100000000;
    } while(_windows.hasOwnProperty(id) === true);
    return id;
  }

  /**
   * Register a given window by assigning a new random id. When the window is closed, it removes the id from available windows.
   * @todo Check if tabs from the registry are also removed when the window is closed.
   * @param {SafariBrowserWindow} _window - The new window to register.
   */
  function registerWindow(_window) {
    var id = '';
    if(_window.id === undefined) {
      id = getUniqueWindowId(_windows);
      // Registered windows
      _windows[id] = _window;

      _window.addEventListener('close', function handler() {
        _window.removeEventListener('close', handler, false);
        delete _windows[id];
      }, false);
    }
  }

  /**
   * Register all available windows with a new random unique id. Its purpose is to be called on the extension startup.
   */
  function registerWindows() {
    var browserWindows = safari.application.browserWindows;
    var id;

    for(var i=0, len=browserWindows.length; i<len; i++) {
      registerWindow(browserWindows[i]);
    }
  }
  // Windows ends here

  // Tabs
  /**
   * Returns a random tab ID that isn’t found in the tabs registry.
   * @param {SafariBrowserTab[]} tabs - An array of tabs.
   * @returns {string} Unique Identifier with `tab-` prefix.
   */
  function getUniqueTabId(_tabs) {
    var id;
    do {
      id = 'tab-' + Math.random() * 100000000;
    } while(_tabs.hasOwnProperty(id) === true);
    return id;
  }

  /**
   * Register a given tab by assigning a new random id in the tabs registry. When the tab is closed, it removes the id from the tabs registry.
   * @param {SafariBrowserTab} _tab
   */
  function registerTab(_tab) {
    var id;
    if(_tab.id === undefined) {
      id = getUniqueTabId(_tabs);
      // Registered tabs
      _tabs[id] = _tab;

      // Removes the id from {@link _tabs}
      _tab.addEventListener('close', function handler() {
        _tab.removeEventListener('close', handler, false);
        delete _tabs[id];
      }, false);
    }
  }

  /**
   * Search for {@link SafariBrowserTab} without an id and set a new random unique id.
   */
  function registerTabs() {
    var status = 0,
        windows = safari.application.browserWindows;

    var i, u, tabsLen, windowsLen, windowTabs;
    // Concat tabs from different windows

    // For each window
    for(i=0, windowsLen=windows.length; i<windowsLen; i++) {
      windowTabs = windows[i].tabs;
      // For each tabs in the window
      for(u=0, tabsLen=windowTabs.length; u<tabsLen; u++) {
        registerTab(windowTabs[u]);
      }
    }
  }
  // Tabs ends here

  // There’s no way to specify for windows or tabs (it must be guessed). It seems that when a window is created it first fires the event for the tab and then the window.
  safari.application.addEventListener('open', function(ev) {
    // If a new window was created
    if(ev.target instanceof SafariBrowserWindow) {
      registerWindow(ev.target);
    } else if (ev.target instanceof SafariBrowserTab) {
      registerTab(ev.target);
    } else {
      console.log('Reaching else');
    }
  }, true);

  registerTabs();
  registerWindows();
  return exports;
})();

// background.js<safari>
