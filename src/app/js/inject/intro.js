/**
 * @fileoverview This file contains the opening statements of `inject.js`.
 */

chrome.runtime.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);

// intro.js ends here
