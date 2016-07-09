/**
 * @fileOverview This file contains the opening statements of `inject.js` for Safari.
 * @name intro.js<safari>
 * @author Etienne Prud’homme
 * @license MIT
 */

/* jshint ignore:start */
// Injected scripts in Safari get also injected in iFrames
if (window.top === window) {
  /* jshint ignore: */
  /**
   * @namespace
   * @property {object} chrome.runtime.lastError - This will be defined during an API method callback if there was an error
   * @property {string} [chrome.runtime.lastError.message] - Details about the error which occurred.
   */
  var chrome = {
    runtime: {
      /**
       * Sends a single message to event listeners within the extension or a
       * different extension. If sending to the current extension, the
       * {@link chrome.runtime.onMessage} event will be fired in each page, or
       * {@link chrome.runtime.onMessageExternal}, if a different extension. Note that
       * extensions cannot send messages to content scripts using this method. To
       * send messages to content scripts, use {@link chrome.tabs.sendMessage}.
       * @param {string} [extensionId] - The ID of the extension to send the message to. If `undefined` or `null`, the current extension is used.
       * @param {*} message - The message to sent.
       * @param {object} [options]
       * @param {bool} [options.includeTlsChannelId] - Whether the TLS channel ID will be passed into onMessageExternal for processes that are listening for the connection event.
       * @param {chrome.runtime.sendMessage~callback} [callback] - Function called when there’s a response. Note: The response can be any object.
       */
      sendMessage: function(extensionId, message, options, callback) {

      },
      lastError: null,
      onMessage: {
        /**
         * Fired when a message is sent from either an extension process or a
         * content script.
         * @param {chrome.runtime.onMessage.addListener~callback} callback -
         */
        addListener: function(callback) {

        }
      }
    },
    extension: {
      /**
       * Converts a relative path within an extension install directory to a fully-qualified URL.
       * @param {string} path - A path to a resource within an extension expressed relative to its install directory.
       * @returns {string} The fully-qualified URL.
       */
      getURL: function(url) {
      }
    },
    storage: {
      sync: {
        /**
         * Gets one or more items from storage.
         * @param {string|string[]|object} [keys] - A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
         * @param {chrome.storage.sync.get~callback} callback - Callback with storage items, or on failure (in which case runtime.lastError will be set).
         * @returns {object} Object with items in their key-value mappings.
         */
        get: function(keys, callback) {
        },
        /**
         * Sets multiple items.
         * @param {object} keys - An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
         * Primitive values such as numbers will serialize as expected. Values with a typeof `object` and `function` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), Date, and Regex (serialize using their `String` representation).
         * @param {chrome.storage.sync.set~callback} [callback] - Callback on success, or on failure (in which case {@link chrome.runtime.lastError} will be set).
         */
        set: function(keys, callback) {
        }
      }
    },
    tabs: {
      /**
       * Sends a single message to the content script(s) in the specified tab, with an optional callback to run when a response is sent back. The {@link chrome.runtime.onMessage} event is fired in each content script running in the specified tab for the current extension.
       * @param {int} tabId - The tab to send the message to.
       * @param {*} message - Any object that can be serialized.
       * @param {object} [options]
       * @param {int} [frameId] - Send a message to a specific frame identified by {@link frameId} instead of all frames in the tab.
       * @param {chrome.tabs.sendMessage~responseCallback} [responseCallback] - Function called when there’s a response. Note: The response can be any object.
       */
      sendMessage: function(tabId, message, options, responseCallback) {
      },
      /**
       * Gets all tabs that have the specified properties, or all tabs if no properties are specified.
       * @param {object} queryInfo
       * @param {bool} [queryInfo.active] - Whether the tabs are active in their windows.
       * @param {bool} [queryInfo.pinned] - Whether the tabs are pinned.
       * @param {bool} [queryInfo.highlighted] - Whether the tabs are highlighted.
       * @param {bool} [queryInfo.currentWindow] - Whether the tabs are in the /current window/.
       * @param {bool} [queryInfo.lastFocusedWindow] - Whether the tabs are in the last focused window.
       * @param {tabStatus} [queryInfo.status] - Whether the tabs have completed loading.
       * @param {string} [queryInfo.title] - Match page titles against a pattern.
       * @param {string|string[]} [queryInfo.url] - Match tabs against one or more /URL patterns/. Note that fragment identifiers are not matched.
       * @param {int} [queryInfo.windowId] - The ID of the parent window, or {@link chrome.windows.WINDOW_ID_CURRENT} for the current window.
       * @param {windowType} [queryInfo.windowType] - The type of window the tabs are in.
       * @param {int} [queryInfo.index] - The position of the tabs within their windows.
       * @param {chrome.tabs.query~callback} callback - Threats returned tabs.
       */
      query: function(queryInfo, callback) {
      }
    }
  };

  // intro.js<safari> ends here
