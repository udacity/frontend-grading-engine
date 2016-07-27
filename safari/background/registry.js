/**
 * @fileOverview This adds a module to record windows and tabs in
 * Safari. Otherwise, there’s no way to select a tab (or window) with an ID.
 * @name registry.js<background>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

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
   * Returns the window registered as `active`. It may not conform to the Chrome
   * specs.
   * @returns {SafariBrowserWindow} The active window.
   */
  exports.getActiveWindow = function() {
    return _windows.activeWindow;
  };

  /**
   * Returns the last window that had focus (activated from Safari
   * specifications).
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
   * @param {int} [options.precision=100000000] - Number that will be multiplied
   * to a random number between 0 and 1.
   * @param {int|string} [options.prefix=0] - Number or string that will add the
   * property to itself. It may add the number vlaue or concatenate the String.
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
   * Register a given window by assigning a new random id. When the window is
   * closed, it removes the id from available windows.
   * @todo Check if tabs from the registry are also removed when the window is
   * closed.
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
   * Removes the given {@link SafariBrowserWindow} from the registered windows
   * in {@link _windows}.
   * @param {SafariBrowserWindow} _window - The window to remove.
   */
  function removeWindow(_window) {
    var id = _window.id;
    delete _windows[id];
  }

  /**
   * Register all available windows with a new random unique id. Its purpose is
   * to be called on the extension startup.
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
   * Register a given tab by assigning a new random id in the tabs
   * registry. When the tab is closed, it removes the id from the tabs registry.
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
   * Removes the given {@link SafariBrowserTab} from the registered windows in
   * {@link _tabs}.
   * @param {SafariBrowserTab} tab - The Tab to remove.
   */
  function removeTab(tab) {
    var id = tab.id;
    delete _tabs[id];
  }

  /**
   * Search for {@link SafariBrowserTab} without an id and set a new random
   * unique id.
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

  // There’s no way to specify for windows or tabs (it must be guessed). It
  // seems that when a window is created it first fires the event for the tab
  // and then the window.
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

// registry.js<background> ends here
