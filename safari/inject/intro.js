/*global safari */

/**
 * @fileOverview This file contains the opening statements of `inject.js` for Safari.
 * @name intro.js<safari>
 * @author Etienne Prud’homme
 * @license MIT
 */

/* jshint ignore:start */
// Injected scripts in Safari get also injected in iFrames
if (window.top === window) {
  /* jshint ignore: end*/
  chrome = (function(){
    /**
     * @namespace
     * @property {object} chrome.runtime.lastError - This will be defined during an API method callback if there was an error
     * @property {string} [chrome.runtime.lastError.message] - Details about the error which occurred.
     */
    var chrome = {
      runtime: {
        /**
         * Sends a single message to event listeners within the extension/app or a different extension/app. Similar to {@link chrome.runtime.onMessage} but only sends a single message, with an optional response. If sending to your extension, the runtime.onMessage event will be fired in each page, or {@link chrome.runtime.onMessageExternal}, if a different extension. Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use {@link tabs.sendMessage.}
         * @param {string} [extensionId] - The ID of the extension to send the message to. If `undefined` or `null`, the current extension is used.
         * @param {*} message - The message to sent.
         * @param {object} [options]
         * @param {bool} [options.includeTlsChannelId] - Whether the TLS channel ID will be passed into onMessageExternal for processes that are listening for the connection event.
         * @param {chrome.runtime.sendMessage~callback} [callback] - Function called when there’s a response. Note: The response can be any object.
         */
        sendMessage: function(extensionId, message, options, callback) {

        },
        lastError: null,
        /**
         * An object containing information about the script context that sent a message or request.
         * @namespace
         * @property {chrome.tabs.Tab} [tab] - The {@link chrome.tabs.Tab} which opened the connection, if any. This property will only be present when the connection was opened from a tab (including content scripts), and only if the receiver is an extension, not an app.
         * @todo @property {int} [frameId] - The frame that opened the connection. 0 for top-level frames, positive for child frames. This will only be set when tab is set.
         * @todo @property {string} [id] - The ID of the extension or app that opened the connection, if any.
         * @todo @property {string} [url] - The URL of the page or frame that opened the connection. If the sender is in an iframe, it will be iframe’s URL not the URL of the page which hosts it.
         * @todo @property {string} [tlsChannelId] - The TLS channel ID of the page or frame that opened the connection, if requested by the extension or app, and if available.
         */
        MessageSender: {
          tab: null,
          frameId: null
          // id: null,
          // url: null,
          // tlsChannelId: null
        },
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
          return safari.extension.baseURI + url;
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
            askAdapter('wrapper.storage.sync.get', {keys: keys})
              .then(function(values) {
                if(callback instanceof Function) {
                  console.log('In `chrome.storage.sync.get` returning: ' + values.toString());
                  callback(values);
                }
              }).catch(function(error) {
                throw new Error(error);
              });
          },
          /**
           * Sets multiple items.
           * @param {object} keys - An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
           * Primitive values such as numbers will serialize as expected. Values with a typeof `object` and `function` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), Date, and Regex (serialize using their `String` representation).
           * @param {chrome.storage.sync.set~callback} [callback] - Callback on success, or on failure (in which case {@link chrome.runtime.lastError} will be set).
           */
          set: function(keys, callback) {
            // Send the request
            askAdapter('wrapper.storage.sync.set', {keys: keys})
              .then(function() {
                if(callback instanceof Function) {
                  callback();
                }
              }).catch(function(error) {
                throw new Error(error);
              });
          }
        }
      }
    };

    /**
     * Serialize an Object to be supported by Safari when sent as JSON.
     * @param {object} obj - Any object that will be converted to JSON. It supports RegExp and Date.
     * @returns {string} The JSON string.
     */
    function serialize(obj) {
      // var topObject = true;

      return JSON.stringify(obj, function(key, value) {
        // if(topObject) {
        //   topObject = false;
        //   return value;
        // }

        if (value instanceof String || value instanceof RegExp || value instanceof Date) {
          return value.toString();
        } else if(value instanceof Array) {
          return value;
        }
        //  else if(value instanceof Object && !topObject) {
        //   return {};
        // }

        return value;
      });
    }

    /**
     * Sends a message to the adapter function and return a Promise that resolves when the response is received.
     * @param {} channel
     * @param {} message
     * @returns {Promise} A Promise that resolves when the response is received.
     */
    function askAdapter(channel, message) {
      return new Promise(function(resolve, reject) {
        // Register the response receiver before sending the message (else it won’t be fired)
        safari.self.addEventListener('message', function responseHandler(ev) {
          var data = JSON.parse(ev.message);
          channel = channel.replace('wrapper.', 'chrome.');
          // Remove self since just ask --> response
          safari.self.removeEventListener('message', responseHandler);
          if(ev.name === channel) {
            if(data.name === 'ok') {
              return resolve(data.response);
            } else if(data.name === 'error') {
              // runtime.lastError
              return reject(data.response);
            } else {
              return reject('The Global Page sent an invalid response');
            }
          }
        }, false);
        sendMessageToAdapter(channel, message);
      });
    }

    function sendMessageToAdapter(channel, message) {
      var JSONmessage = serialize(message);
      safari.self.tab.dispatchMessage(channel, JSONmessage);
    }
    /**
     * Callback when there’s a message sent to the extension channel (can be both the extension or a /content-script/).
     * @callback chrome.runtime.onMessage.addListener~callback
     * @param {*} message - The message sent by the calling script.
     * @param {MessageSender} sender - The sender.
     * @param {function} sendResponse - Function to call (at most once) when there’s a response. The argument should be any JSON-ifiable object. If there’s more than one {@link chrome.runtime.onMessage} listener in the same document, then only one may send a response.
     */

    /**
     * Callback to pass the received a response when executing {@link chrome.runtime.senMessage}.
     * @callback chrome.runtime.sendMessage~responseCallback
     * @param {*} response - The JSON response object sent by the handler of the message. If an error occurs while connecting to the extension, the callback will be called with no arguments and {@link chrome.runtime.lastError} will be set to the error message.
     */

    /**
     * Callback when getting storage items, or on failure (in which case {@link chrome.runtime.lastError} will be set).
     * @callback chrome.storage.sync.get~callback
     * @param {object} items - Object with items in their key-value mappings.
     */

    /**
     * Callback when setting storage items, or on failure (in which case {@link chrome.runtime.lastError} will be set).
     * @callback chrome.storage.sync.set~callback
     */

    /**
     * Callback to process tabs returned by {@link chrome.tabs.query}.
     * @callback chrome.tabs.query~callback
     * @param {Tab[]} results - The results of the tabs query.
     */

    /**
     * Callback to pass the received a response when executing {@link chrome.tabs.senMessage}.
     * @callback chrome.tabs.sendMessage~responseCallback
     * @param {*} response - The JSON response object sent by the handler of the message. If an error occurs while connecting to the extension, the callback will be called with no arguments and {@link chrome.runtime.lastError} will be set to the error message.
     */
    return chrome;
  })();

  // intro.js<safari> ends here
