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


// background.js<safari>
