/**
 * @fileOverview This file contains the opening statements of
 * `browser_action.js` for the Safari Browser. With this file, a function will
 * wrap the original `browser_action.js`. It prevents executing the code until
 * the `chrome` namespace is fully loaded.
 * @name intro.js<action_page>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

var chrome;

/**
 * Blocks execution until the Chrome namespace is fully loaded.
 */
/* jshint ignore:start */
function waitChromeNS() {
/* jshint ignore:end */


// intro.js<popover> ends here
