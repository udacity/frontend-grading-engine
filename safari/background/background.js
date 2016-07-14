/*global safari, SafariBrowserTab, SafariBrowserWindow */

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

// Initializes the logs if not created
safari.extension.settings.logs = safari.extension.settings.logs || [];

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
     * @param {bool} [queryInfo.currentWindow] - TODO Whether the tabs are in the /current window/. Note: the current window doesn’t mean it’s the active one. It means that the window is currently executing.
     * @todo param {string} tabId - The tab to return
     * @returns {int|Object[]} Result of the query of -1 on error.
     */
    query: function(queryInfo) {
      var validQuery, windows, tabs;
      try {
        validQuery = false;
        windows = safari.application.browserWindows;
        tabs = [];

        if(queryInfo instanceof Object) {
          // queryInfo.currentWindow
          if(queryInfo.currentWindow) {
            // Because there’s no way I know to select the window currently running in Safari, the active window (or `lastFocusedWindow` one if null) will be used instead. If someone successfully thriggers an action page that isn’t focused, it’s an undefined behavior.
            windows = registry.getActiveWindow();
            if(windows === null) {
              windows = registry.getLastFocused();
            }
            // Put it in an array
            windows = [windows];
            validQuery = true;
          }

          // queryInfo.active
          if(queryInfo.active === true) {
            tabs = makeTabType(activeTabs(windows));
            validQuery = true;
          } else {
            tabs = makeTabType(getTabs(windows));
            validQuery = true;
          }
        }

        // TODO: Validate queries
        if(!validQuery) {
          extensionLog(new Error('No valid query is specified'));
        }

        /**
         * Gets all active {@link SafariBrowserTab} from given an array {@link SafariBrowserWindow},
         * @param {SafariBrowserWindow[]} windows - Windows to get all active tabs.
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
         * @param {SafariBrowserWindow[]} windows - An array of {@link SafariBrowserWindow}.
         * @returns {SafariBrowserTab[]} List of tabs from {@link windows}.
         */
        function getTabs(windows) {
          var i, len, u, u_len, windowTabs, index, resultTabs = [];
          for(i=0, len=windows.length; i<len; i++) {
            windowTabs = windows[i].tabs;
            for(u=0, u_len=windowTabs.length; u<u_len ;) {
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

// Listens to the client adapter
safari.application.addEventListener('message', function(event) {
  var status = -1;
  var message = JSON.parse(event.message);

  // Safari uses ev.name for the name of the event while using /message/ for communication between scripts.
  switch(event.name) {
  case 'wrapper.storage.sync.get':
    // Returns -1 on error otherwise the response
    status = wrapper.storage.sync.get(message.keys);
    respondBack('chrome.storage.sync.get', status);
    break;
  case 'wrapper.storage.sync.set':
    // Returns -1 on error otherwise the response
    status = wrapper.storage.sync.set(message.keys);
    respondBack('chrome.storage.sync.set', status);
    break;
  case 'wrapper.runtime.sendMessage':
    // TODO
    // Returns -1 on error otherwise the response
    status = wrapper.runtime.sendMessage();
    respondBack('chrome.runtime.sendMessage', status);
    break;
  case 'wrapper.tabs.query':
    // Returns -1 on error otherwise the response
    status = wrapper.tabs.query(message.query);

    // Note: The docs don’t officially specify throwing lastError
    respondBack('chrome.tabs.query', status);
    break;
  }

  /**
   * Function that sends back the result of the request and also take cares of status codes.
   * @param {string} channel - The name of the request receiver.
   * @param {int|Object} status - The response of a query. On error, it should be `-1`.
   */
  function respondBack(channel, status) {
    var response;
    if(status === -1) {
      response = {name: 'error', response: wrapper.runtime.lastError.message};
    } else {
      response = {name: 'ok', response: status};
    }
    event.target.page.dispatchMessage(channel, JSON.stringify(response));
  }
  // Since its lifetime is for a callback
  wrapper.runtime.lastError = undefined;
}, false);

/**
 * Registers Tabs and Windows.
 */
var registry = (function() {
  var _windows = {
    activeWindow: null,
    lastFocusedWindow: null
  };
  var _tabs = {};
  var exports = {};

  /**
   * Returns registered windows from {@link _windows}.
   * @returns {SafariBrowserWindow[]} Registered windows.
   */
  exports.getWindows = function() {
    return _windows;
  };

  /**
   * Returns registered tabs from {@link _tabs}.
   * @returns {SafariBrowserTab[]} Registered tabs.
   */
  exports.getTabs = function() {
    return _tabs;
  };

  /**
   * Returns the window registered as `active`. It may not conform to the Chrome specs.
   * @returns {SafariBrowserWindow} The active window.
   */
  exports.getActiveWindow = function() {
    return _windows.activeWindow;
  };

  /**
   * Returns the last window that had focus (activated from Safari specifications).
   * @returns {SafariBrowserWindow} The last window that had focus.
   */
  exports.getLastFocused = function() {
    return _windows.lastFocusedWindow;
  };

  /**
   * Returns the {@link SafariBrowserTab} corresponding to a given ID.
   * @param {string|int} id - The ID of the registered tab.
   * @returns {SafariBrowserTab} The tab that has the given ID or -1 on error.
   */
  exports.getTabById = function(id) {
    var tab;
    try {
      if(_tabs.hasOwnProperty(id)) {
        tab = _tabs[id];
      } else {
        extensionLog('Invalid tab id: ' + id);
      }
    } catch(e) {
      return -1;
    }
    return tab;
  };
  /**
   * Returns a random property that isn’t found in an Object.
   * @param {object} obj - Object to find uniqueness of a property name.
   * @param {object} [options] - Options for generating the property.
   * @param {int} [options.precision=100000000] - Number that will be multiplied to a random number between 0 and 1.
   * @param {int|string} [options.prefix=0] - Number or string that will add the property to itself. It may add the number vlaue or concatenate the String.
   * @returns {int} Unique Identifier.
   */
  function getUniqueProperty(obj, options) {
    var prop,
        _options = options || {},
        precision = _options.precision || 100000000,
        prefix = _options.prefix || 0;

    do {
      prop = prefix + Math.floor(Math.random() * precision);
    } while(obj.hasOwnProperty(prop) === true);
    return prop;
  }

  // Windows
  /**
   * Register a given window by assigning a new random id. When the window is closed, it removes the id from available windows.
   * @todo Check if tabs from the registry are also removed when the window is closed.
   * @param {SafariBrowserWindow} _window - The new window to register.
   */
  function registerWindow(_window) {
    var id = '';
    if(_window.id === undefined) {
      id = getUniqueProperty(_windows);
      // Registered windows
      _windows[id] = _window;
      _window.id = id;

      // _window.addEventListener('close', function handler() {
      //   _window.removeEventListener('close', handler, false);
      //   delete _windows[id];
      // }, false);
    }
  }

  /**
   * Removes the given {@link SafariBrowserWindow} from the registered windows in {@link _windows}.
   * @param {SafariBrowserWindow} _window - The window to remove.
   */
  function removeWindow(_window) {
    var id = _window.id;
    delete _windows[id];
  }

  /**
   * Register all available windows with a new random unique id. Its purpose is to be called on the extension startup.
   */
  function registerWindows() {
    var browserWindows = safari.application.browserWindows;
    var id, activeWindow;

    for(var i=0, len=browserWindows.length; i<len; i++) {
      registerWindow(browserWindows[i]);
    }
    activeWindow = safari.application.activeBrowserWindow;
    _windows.activeWindow = activeWindow;
    _windows.lastFocusedWindow = activeWindow;
  }
  // Windows ends here

  // Tabs

  /**
   * Register a given tab by assigning a new random id in the tabs registry. When the tab is closed, it removes the id from the tabs registry.
   * @param {SafariBrowserTab} _tab - The new tab to register.
   */
  function registerTab(_tab) {
    var id;
    if(_tab.id === undefined) {
      id = getUniqueProperty(_tabs);
      // Registered tabs
      _tabs[id] = _tab;
      _tab.id = id;

      // // Removes the id from {@link _tabs}
      // _tab.addEventListener('close', function handler() {
      //   _tab.removeEventListener('close', handler, false);
      //   delete _tabs[id];
      // }, false);
    }
  }

  /**
   * Removes the given {@link SafariBrowserTab} from the registered windows in {@link _tabs}.
   * @param {SafariBrowserTab} tab - The Tab to remove.
   */
  function removeTab(tab) {
    var id = tab.id;
    delete _tabs[id];
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
      extensionLog('Got something else than a Tab or Window');
    }
  }, true);

  safari.application.addEventListener('close', function(ev) {
    // If a window is about to close
    if(ev.target instanceof SafariBrowserWindow) {
      removeWindow(ev.target);
    } else if (ev.target instanceof SafariBrowserTab) {
      // If a tab is about to close
      removeTab(ev.target);
    } else {
      extensionLog('Got something else than a Tab or Window');
    }
  }, true);

  safari.application.addEventListener('activate', function(ev) {
    if(ev.target instanceof SafariBrowserWindow) {
      _windows.activeWindow = ev.target;
      // TODO: What about when it’s closed?
      _windows.lastFocusedWindow = ev.target;
    }
  }, true);

  safari.application.addEventListener('deactivate', function(ev) {
    if(ev.target instanceof SafariBrowserWindow) {
      _windows.activeWindow = null;
    }
    console.log(ev);
  }, true);

  registerTabs();
  registerWindows();
  return exports;
})();

// background.js<safari>
