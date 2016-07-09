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
      /**
       * Emulates the chrome storage behavior (setter) by using the {@link safari.extension.settings} mechanism.
       * @param {} keys - An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
       * Primitive values such as numbers will serialize as expected. Values with a typeof `object` and `function` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), Date, and Regex (serialize using their `String` representation).
       * @returns {int} 0 on success and -1 on error.
       * @throws {error} Error in the {@link keys} argument and sets {@link wrapper.runtime.lastError}.
       */
    }
  },
  runtime: {
    lastError: undefined
  },
  tabs: {
    /**
     * Gets all tabs that have the specified properties, or all tabs if no properties are specified.
     * @param {object} queryInfo
     * @param {bool} [queryInfo.active] - TODO Whether the tabs are active in their windows. (Does not necessarily mean the window is focused.)
     * @param {bool} [queryInfo.currentWindow] - TODO Whether the tabs are in the /current window/.
     * @todo param {string} tabId - The tab to return
     */
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

  return windows;

  /**
   * Returns a random window ID that isn’t found in the windows array.
   * @param {SafariBrowserWindow[]} windows - An array of windows.
   * @returns {string} Unique identifier with `window-` prefix.
   */
  function getUniqueWindowId(windows) {
    var id;
    do {
      id = 'window-' + Math.random() * 100000000;
    } while(windows.indexOf(id) !== -1);
    return id;
  }
}

/**
 * Search for {@link SafariBrowserTab} without an id and set a new random unique id.
 * @returns {SafariBrowserTab[]} The number of newly registred tabs.
 */
function registerTabs() {
  var windows = registerWindows();
  var tabs = [];
  var status = 0;

  var i, len;
  // Concat tabs from different windows
  for(i=0, len=windows.length; i<len; i++) {
    // This way we get a reference of the tab instead of a copy (such as when using concat)
    tabs.push.apply(windows[i].tabs);
  }

  for(i=0, len=windows[i].length; i<len; i++) {
    if(tabs[i].id === undefined) {
      tabs[i].id = getUniqueTabId(tabs);
      status++;
    }
  }
  return tabs;

  /**
   * Returns a random tab ID that isn’t dounf in the tabs array.
   * @param {SafariBrowserTab[]} tabs - An array of tabs.
   * @returns {string} Unique Identifier with `tab-` prefix.
   */
  function getUniqueTabId(tabs) {
    var id;
    do {
      id = 'tab-' + Math.random() * 100000000;
    } while(tabs.indexOf(id) !== -1);
    return id;
  }
}

// Listens to the adapter
safari.application.addEventListener('chrome.safari.adapter', function(event) {
  var status;
  switch(event.name) {
  case 'chrome.storage.sync.get':
    status = wrapper.storage.sync.get(event.message.keys);

    if(status === -1) {
      status = wrapper.runtime.lastError;
      event.target.page.dispatchMessage('chrome.storage.sync.get', status);
    }
    break;
  case 'chrome.storage.sync.set':
    status = wrapper.storage.sync.set(event.message.keys);

    if(status === -1) {
      status = wrapper.runtime.lastError;
      event.target.page.dispatchMessage('chrome.storage.sync.set', status);
    }
    break;
  case 'chrome.runtime.sendMessage':

    break;
  case 'chrome.tabs.query':
    status = wrapper.tabs.query(event.message.query);

    // Note: The docs don’t officially specify throwing lastError
    if(status === -1) {
      status = wrapper.runtime.lastError;
      event.target.page.dispatchEvent('chrome.tabs.query', status);
    }
    break;
  }

  // Since its lifetime is for a callback
  wrapper.runtime.lastError = undefined;
}, false);

// background.js<safari>
