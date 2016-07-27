/*global chrome */

/**
 * @fileOverview This file adds support for the {@link chrome.storage.local} API in Firefox. This API isn’t implemented until Firefox version 48 for content-scripts.
 * @name background.js<firefox>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // debugger;
  // console.group();
  // console.log("sendResponse = ", sendResponse.toString());
  // console.log("sender = ", sender);
  // console.log("message = ", message);
  // console.groupEnd();

  if(!message)  {
    Promise.reject();
  }

  switch(message.type) {
  case 'chrome.storage.local.get':
    chrome.storage.local.get(message.data, function(response) {
      // debugger;
      sendResponse(response);
    });
    break;

  case 'chrome.storage.local.set':
    chrome.storage.local.set(message.data, function(response) {
      // debugger;
      response = chrome.runtime.lastError ? {status: 1, error: chrome.runtime.lastError.message} : {status: 0};
      sendResponse(response);
    });
    break;
  };
  return true;
});

// background.js<firefox> ends here
