/**
 * @fileOverview This file contains the Safari closing statements for the
 * browser action page appended to the main file.
 * @name outro.js<browser_action>
 * @author Etienne Prud’homme
 * @license GPLv3
 */

/* jshint ignore:start */
}
/* jshint ignore:end */

window.setInterval(function handler() {
  try {
    if(typeof(global.chrome) === typeof(Function)) {
      chrome = global.chrome();
      window.clearInterval(handler);
      waitChromeNS();
    } else {
      if(global.chrome.initialized === true) {
        window.clearInterval(handler);
        waitChromeNS();
      } else {
        return;
      }
    }
  } catch(e) {
    return;
  }
}, 100);

// outro.js<browser_action> ends here
// browser_action.js ends here
