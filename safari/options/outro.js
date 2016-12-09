/*global waitChromeNS, chrome, safari */

/**
 * @fileOverview This file contains the Firefox closing statements for
 * the options page script appended to the main file.
 * @name outro.js<options>
 * @author Etienne Prud’homme
 * @license MIT
 */

var backButton = document.getElementById('back-button');
backButton.style.display = 'block';

backButton.addEventListener('click', function handler(event) {
  window.history.back();
});

// When the popover is closed (it actually loses focus, but it’s
// still there).
window.addEventListener('blur', function() {
  window.location.reload();
});
/* jshint ignore:start */
}
/* jshint ignore:end */

var handler = window.setInterval(function() {
  var contentWindow = safari.extension.globalPage.contentWindow;
  try {
    // If the module isn’t initialized, intialize it.
    if(typeof(contentWindow.chrome) ===
       typeof(Function)) {
      chrome = contentWindow.chrome();
      window.clearInterval(handler);
      waitChromeNS();
    } else {
      // If the module is initialized, assign the module.
      if(contentWindow.chrome.initialized === true) {
        chrome = contentWindow.chrome;
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

// outro.js<options> ends here
// options.js ends here
