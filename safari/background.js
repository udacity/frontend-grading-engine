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

// Initializes the logs if not created
safari.extension.settings.logs = safari.extension.settings.logs || [];

/**
 * Store logging informations in the extension settings.
 * @param {string|error} message - The message to log as a String or an Error.
 * @throws {Error} Error in the arguments of the function (not a String nor an Error).
 */
function extensionLog(log) {
  // Cache logs to append a single log
  var logs = safari.extension.settings.logs;
  var stack, logMessage;

  if(log instanceof Error) {
    logMessage = log.message;
    stack = log.stack;
  } else if (logMessage instanceof String){
    logMessage = log;
    stack = new Error().stack;
  } else {
    // Log error of itself
    extensionLog('Invalid log type: ' + log.toString());
    throw new Error('Extension logging error');
  }

  // Adding the new log
  logs.push({
    message: logMessage,
    stack: stack,
    timestamp: Date.now() / 1000
  });

  // Record the new logs
  safari.extension.settings.logs = logs;
  // This should be in the Background script and shouldn’t conflict with page scripts
  console.warn(log);

  // Actually throw that error
  if(log instanceof Error) {
    throw log;
  }
}

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
                extensionLog(new Error('An item of the `keys` array wasn’t a String'));
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
              extensionLog(new Error('The `keys` object does not contain any property on its own'));
            }

            for(i=0, len=keysArray.length; i<len; i++) {
              key = keysArrays[i];
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
          if(!keys || keys instanceof String || keys instanceof Array) {
            extensionLog(new Error('The `keys` argument is not a valid Object with keys/properties'));
          }

          var keysArray = Object.keys(keys),
              key = '',
              value = '';

          if(keysArray.length === 0) {
            extensionLog(new Error('The `keys` object does not contain any property on its own'));
          }

          for(i=0, len=keys.length; i<len; i++) {
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
          extensionLog(new Error('No valid query is specified'));
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
        wrapper.runtime.lastError = e;
        return -1;
      }
      return resultTabs;
    }
  }
};

// Listens to the client adapter
safari.application.addEventListener('message', function(event) {
  var status = -1;

  // Safari uses ev.name for the name of the event while using /message/ for communication between scripts.
  switch(event.name) {
  case 'wrapper.storage.sync.get':
    // Returns -1 on error otherwise the response
    status = wrapper.storage.sync.get(event.message.keys);
    respondBack('chrome.storage.sync.get', status);
    break;
  case 'wrapper.storage.sync.set':
    // Returns -1 on error otherwise the response
    status = wrapper.storage.sync.set(event.message.keys);
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
    status = wrapper.tabs.query(event.message.query);

    // Note: The docs don’t officially specify throwing lastError
    respondBack('chrome.tabs.query', status);
    break;
  }

  function respondBack(channel, status) {
    var response;
    if(status === -1) {
      response = {name: 'error', response: wrapper.runtime.lastError.message};
    } else {
      response = {name: 'ok', response: status};
    }
    event.target.page.dispatchEvent(channel, response);
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
        _options = options || {};
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

  function removeWindow(_window) {
    var id = _window.id;
    delete _windows[id];
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
   * Register a given tab by assigning a new random id in the tabs registry. When the tab is closed, it removes the id from the tabs registry.
   * @param {SafariBrowserTab} _tab
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
    console.log(ev);
  }, true);
  safari.application.addEventListener('deactivate', function(ev) {
    console.log(ev);
  }, true);

  registerTabs();
  registerWindows();
  return exports;
})();

// background.js<safari>
