/*global safari */

/**
 * @fileOverview This file contains the opening statements of
 * `browser_action.js` for the Safari Browser.
 * @name intro.js<action_page>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

window.setInterval(function handler() {
  try {
    if(typeof(safari.extension.globalPage.contentWindow.chrome) === typeof(Function)) {
      chrome = safari.extension.globalPage.contentWindow.chrome();
      window.clearInterval(handler);
      waitChromeNS();
    } else {
      return;
    }
  } catch(e) {
    return;
  }
}, 100);

/**
 * Blocks execution until the Chrome namespace is fully loaded.
 */
/* jshint ignore:start */
function waitChromeNS() {
/* jshint ignore:end */


// intro.js<popover> ends here
