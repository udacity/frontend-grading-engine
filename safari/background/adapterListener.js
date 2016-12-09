/*global wrapper, safari */

/**
 * @fileOverview This file contains the adapter listener (i.e. message
 * passing part) for injected scripts since most of the adaptee
 * methods need higher priviledge (but allowed from a global page).
 * @name adapterListener.js<background>
 * @author Etienne Prud’homme
 * @license MIT
 */

// Listens to the client adapter
safari.application.addEventListener('message', function(event) {
  /**
   * Function that sends back the result of the request and also take
   * cares of status codes.
   * @param {string} channel - The name of the request receiver.
   * @param {int|Object} status - The response of a query. On error,
   * it should be `-1`.
   */
  function respondBack(channel, status) {
    var page = event.target.page;
    var response;
    if(status === -1) {
      response = {
        name: 'error',
        response: wrapper.runtime.lastError.message
      };
    } else {
      response = {
        name: 'ok',
        response: status
      };
    }
    page.dispatchMessage(channel, JSON.stringify(response));
  }

  var status = -1;
  var message = JSON.parse(event.message);

  // Safari uses ev.name for the name of the event while using
  // _message_ for communication between scripts.
  switch(event.name) {
  case 'wrapper.storage.sync.get':
    // Returns -1 on error otherwise the response.
    status = wrapper.storage.sync.get(message.keys);
    respondBack('injected.storage.sync.get', status);
    break;
  case 'wrapper.storage.sync.set':
    // Returns -1 on error otherwise the response.
    status = wrapper.storage.sync.set(message.keys);
    respondBack('injected.storage.sync.set', status);
    break;
  case 'wrapper.runtime.sendMessage':
    // TODO
    // Returns -1 on error otherwise the response.
    status = wrapper.runtime.sendMessage();
    respondBack('injected.runtime.sendMessage', status);
    break;
  case 'wrapper.tabs.query':
    // Returns -1 on error otherwise the response.
    status = wrapper.tabs.query(message.query);

    // Note: The docs don’t officially specify throwing lastError.
    respondBack('injected.tabs.query', status);
    break;
  }
  // Since its lifetime is for a callback
  wrapper.runtime.lastError = undefined;
}, false);

// adapterListener.js<background> ends here
