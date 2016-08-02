/*global safari */

/**
 * @fileOverview This file contains the opening statements of `inject.js` for
 * Safari.
 * @name intro.js<safari>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

/* jshint ignore:start */
// Injected scripts in Safari get also injected in iFrames
if (window.top === window) {
  /* jshint ignore: end*/
  var injected = (function(){
    var pageListener = [];
    /**
     * @namespace
     * @property {object} injected.runtime.lastError - This will be defined
     * during an API method callback if there was an error
     * @property {string} [injected.runtime.lastError.message] - Details about
     * the error which occurred.
     */
    var exports =  {
      runtime: {
        /**
         * Sends a single message to event listeners within the extension/app or
         * a different extension/app. Similar to
         * {@link injected.runtime.onMessage} but only sends a single message,
         * with an optional response. If sending to your extension, the
         * {@link injected.runtime.onMessage} event will be fired in each page,
         * or {@link injected.runtime.onMessageExternal}, if a different
         * extension. Note that extensions cannot send messages to content
         * scripts using this method. To send messages to content scripts, use
         * {@link injected.tabs.sendMessage.}
         * @param {string} [extensionId] - The ID of the extension to send the
         * message to. If `undefined` or `null`, the current extension is used.
         * @param {*} message - The message to sent.
         * @param {object} [options]
         * @todo @param {bool} [options.includeTlsChannelId] - Whether the TLS
         * channel ID will be passed into onMessageExternal for processes that
         * are listening for the connection event.
         * @param {injected.runtime.sendMessage~callback} [callback] - Function
         * called when there’s a response. Note: The response can be any object.
         */
        sendMessage: function(extensionId, message, options, callback) {

        },
        lastError: null,
        /**
         * An object containing information about the script context that sent a
         * message or request.
         * @namespace
         * @property {injected.tabs.Tab} [tab] - The {@link injected.tabs.Tab}
         * which opened the connection, if any. This property will only be
         * present when the connection was opened from a tab (including content
         * scripts), and only if the receiver is an extension, not an app.
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
           * @param {injected.runtime.onMessage.addListener~callback} callback -
           */
          addListener: function(callback) {
            pageListener.push(callback);
          }
        }
      },
      extension: {
        /**
         * Converts a relative path within an extension install directory to a
         * fully-qualified URL.
         * @param {string} path - A path to a resource within an extension
         * expressed relative to its install directory.
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
           * @param {string|string[]|object} [keys] - A single key to get, list
           * of keys to get, or a dictionary specifying default values (see
           * description of the object). An empty list or object will return an
           * empty result object. Pass in null to get the entire contents of
           * storage.
           * @param {injected.storage.sync.get~callback} callback - Callback
           * with storage items, or on failure (in which case
           * {@link injected.runtime.lastError} will be set).
           * @returns {object} Object with items in their key-value mappings.
           */
          get: function(keys, callback) {
            askAdapter('wrapper.storage.sync.get', {keys: keys})
              .then(function(values) {
                if(callback instanceof Function) {
                  console.log('In `injected.storage.sync.get` returning: ' + values.toString());
                  callback(values);
                }
              }).catch(function(error) {
                throw new Error(error);
              });
          },
          /**
           * Sets multiple items.
           * @param {object} keys - An object which gives each key/value pair to
           * update storage with. Any other key/value pairs in storage will not
           * be affected.
           *
           * Primitive values such as numbers will serialize as expected. Values
           * with a typeof `object` and `function` will typically serialize to
           * `{}`, with the exception of `Array` (serializes as expected), Date,
           * and Regex (serialize using their `String` representation).
           * @param {injected.storage.sync.set~callback} [callback] - Callback
           * on success, or on failure (in which case
           * {@link injected.runtime.lastError} will be set).
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
     * @param {object} obj - Any object that will be converted to JSON. It
     * supports RegExp and Date.
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
     * Sends a message to the adapter function and return a Promise that
     * resolves when the response is received.
     * @param {} channel
     * @param {} message
     * @returns {Promise} A Promise that resolves when the response is received.
     */
    function askAdapter(channel, message) {
      return new Promise(function(resolve, reject) {
        // Register the response receiver before sending the message (else it
        // won’t be fired)
        safari.self.addEventListener('message', function responseHandler(ev) {
          var data = JSON.parse(ev.message);
          channel = channel.replace('wrapper.', 'injected.');
          // Remove self since just ask --> response
          safari.self.removeEventListener('message', responseHandler);
          if(ev.name === channel) {
            if(data.name === 'ok') {
              resolve(data.response);
            } else if(data.name === 'error') {
              // runtime.lastError
              reject(data.response);
            } else {
              reject('The Global Page sent an invalid response');
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

    // The injected script receives messages
    safari.self.addEventListener('message', function handler(event) {
      var data = JSON.parse(event.message);
      // To prevent listening to the same event. It may be useless, but Safari
      // always have weird behavior.
      var channel = 0 - parseInt(data.channel);

      /**
       * Set to true when a listener call {@link sendResponse}. The Chrome
       * specs only allow a call to that function.
       */
      var activeResponse = false;

      // The injected script receives messages from a sendMessage method
      if(event.name === 'injected.runtime.onMessage' &&
         pageListener.length > 0) {
        // For each listener, pass the message
        for(var i=0, len=pageListener.length; i<len; i++) {
          // TODO: Add support to the MessageSender field
          pageListener[i](data.message, undefined, sendResponse);
        }

        // If no listeners called sendResponse
        if(activeResponse !== true) {
          sendResponse();
        }
      }

      /**
       * Sends a response from the listener. Can only be called once.
       * @param {*} response - Any JSON-ifiable objects.
       */
      function sendResponse(response) {
        if(activeResponse !== true) {
          activeResponse = true;
          safari.self.tab.dispatchMessage('injected.runtime.onMessage~response', JSON.stringify({response: response, channel: channel}));
        }
      }
    }, false);

    return exports;
    /**
     * Callback when there’s a message sent to the extension channel (can be
     * both the extension or a /content-script/).
     * @callback injected.runtime.onMessage.addListener~callback
     * @param {*} message - The message sent by the calling script.
     * @param {MessageSender} sender - The sender.
     * @param {function} sendResponse - Function to call (at most once) when
     * there’s a response. The argument should be any JSON-ifiable object. If
     * there’s more than one {@link injected.runtime.onMessage} listener in the
     * same document, then only one may send a response.
     */

    /**

     * Callback  to  pass   the  received  a  response   when  executing
     * {@link injected.runtime.senMessage}.
     * @callback injected.runtime.sendMessage~responseCallback

     * @param {*} response - The JSON response object sent by the handler of the
     * message. If an error occurs while connecting to the extension, the
     * callback will be called with no arguments and
     * {@link injected.runtime.lastError} will be set to the error message.
     */

    /**
     * Callback when getting storage items, or on failure (in which case
     * {@link injected.runtime.lastError} will be set).
     * @callback injected.storage.sync.get~callback
     * @param {object} items - Object with items in their key-value mappings.
     */

    /**
     * Callback when setting storage items, or on failure (in which case
     * {@link injected.runtime.lastError} will be set).
     * @callback injected.storage.sync.set~callback
     */

    /**
     * Callback to process tabs returned by {@link injected.tabs.query}.
     * @callback injected.tabs.query~callback
     * @param {Tab[]} results - The results of the tabs query.
     */

    /**
     * Callback to pass the received a response when executing
     * {@link injected.tabs.senMessage}.
     * @callback injected.tabs.sendMessage~responseCallback

     * @param {*} response - The JSON response object sent by the handler of the
     * message. If an error occurs while connecting to the extension, the
     * callback will be called with no arguments and
     * {@link injected.runtime.lastError} will be set to the error message.
     */
  })();

  chrome = injected;

// intro.js<safari> ends here
