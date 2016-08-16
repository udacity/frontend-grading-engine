/*global chrome */

/**
 * @fileOverview This file contains the Firefox opening statements for the browser action script prepended to the main file.
 * @name intro.js<browser_action>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

chrome.runtime.openOptionsPage = function() {
  chrome.tabs.create({url: chrome.extension.getURL('app/options/index.html')});
};

// intro.js<browser_action> ends here
