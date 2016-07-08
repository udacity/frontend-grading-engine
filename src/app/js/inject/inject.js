/**
 * @fileoverview This file manages the injection of several JavaScript files. It contains most procedure for injecting those files, but doesn’t handle the conditional injection part.
 * @name inject.js<inject>
 * @author Cameron Pittman
 *         Etienne Prud’homme
 * @license MIT
 */

/**
 * List of items id that were injected in the page. It is used to later remove them.
 * @type {string[]}
 */
var injectedElementsOnPage = [];

/**
 * The meta tag that is used to load and activate a file of tests.
 * @type {Element}
 */
var metaTag = document.querySelector('meta[name="udacity-grader"]');

/**
 * Finds Web Components templates.
 * @returns {Promise}
 */
function importFeedbackWidget() {
  var twScript = document.querySelector('script#udacity-test-widget');

  if (!twScript) {
    return injectIntoDocument('script', {
      src: chrome.extension.getURL('app/templates/components.js'),
      id: 'udacity-test-widget'
    }, 'head');
  } else {
    return Promise.resolve();
  }
}

/**
 * Inject the Grading Engine inside the current Document.
 * @returns {Promise}
 */
function injectGradingEngine() {
  return injectIntoDocument('script', {
    src: chrome.extension.getURL('app/js/libs/GE.js'),
    id: 'udacity-front-end-feedback'
  }, 'head');
}

/**
 * Load custom libraries for the Grading Engine (i.e. jsgrader.js).
 * @returns {Promise}
 */
function loadLibraries() {
  if (metaTag) {
    var libraries = metaTag.getAttribute('libraries');
  }

  if (libraries) {
    libraries = libraries.split(' ');
  } else {
    return Promise.resolve();
  }

  var loadedLibs = 0;
  return Promise.all(
    libraries.map(function(lib) {
      return injectIntoDocument('script', {src: chrome.extension.getURL('app/js/libs/' + lib + '.js')}, 'head');
    })
  );
}

/**
 * Loads asynchronously the JSON file containing the tests.
 * @returns {Promise}
 */
function loadJSONTestsFromFile() {
  if (metaTag) {
    return new Promise(function(resolve, reject) {
      // http://stackoverflow.com/a/14274828
      var xmlhttp = new XMLHttpRequest();
      var url = document.URL.substr(0, document.URL.lastIndexOf('/') + 1) + metaTag.content;
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
          resolve(xmlhttp.responseText);
        } else if (xmlhttp.status >= 400) {
          reject(false);
        }
      };
      xmlhttp.open('GET', url, true);
      xmlhttp.send();
    });
  } else {
    return Promise.resolve(false);
  }
}

// You don’t have access to the GE here, but you can inject a script into the document that does.
/**
 * Register test suites from the JSON data.
 * @param {string} json - JSON containing tests for the Grading Engine.
 * @returns {Promise}
 * @throws {Error} Errors about the JSON file.
 */
function registerTestSuites(json) {
  if (!json) {
    return Promise.resolve();
  }
  var errorMsg = null;
  // validating the JSON
  try {
    if (json.length > 0) {
      JSON.parse(json);
    }
  } catch (e) {
    if (json.indexOf('\\') > -1) {
      errorMsg = 'Are you trying to use “\\” in a RegEx? Try using \\\\ instead.';
    } else {
      errorMsg = 'Invalid JSON file format.';
    }
  }
  try {
    json = JSON.stringify(json);
  } catch (e) {
    errorMsg = 'Invalid JSON format.';
  }

  if (errorMsg) {
    alert(errorMsg);
    throw new Error(errorMsg);
  } else {
    return injectIntoDocument('script', {text: 'UdacityFEGradingEngine.registerSuites(' + json + ');'}, 'head');
  }
}

/**
 * Checks and injects custom Unit Tests.
 * @returns {Promise}
 */
function loadUnitTests() {
  var unitTests = null;
  if (metaTag) {
    unitTests = metaTag.getAttribute('unit-tests');
  }
  if (!unitTests) {
    return Promise.resolve();
  }

  return injectIntoDocument('script', {src: unitTests, defer: 'defer'});
}

/**
 * Activates the Grading Engine by injecting itself in the Document. Not to be confused with {@link StateManager.turnOn}. This method is called from {@link StateManager~runLoadSequence}.
 * @returns {Promise}
 */
function turnOn() {
  // console.log('Turned on from turnOn()');
  return injectIntoDocument('script', {
    id: 'ud-grader-options',
    innerHTML: 'UdacityFEGradingEngine.turnOn();'
  }, 'head');
}

/**
 * Stops {@link StateManager~runLoadSequence} until all tests are loaded. This is necessary because the Grading Engine is activated thought the page context. It isn’t a content script like this file.
 * @todo Add a timeout. If (for some reason) the event is never fired, it would probably block the widget.
 * @returns {Promise} A `Promise` that fulfills when all tests are loaded
 */
function waitForTestRegistrations() {
  return new Promise(function(resolve, reject) {
    window.addEventListener('tests-registered', function(data) {
      // console.log('tests-registered received');
      return resolve();
    });
  });
}

// StateManager() was here

var stateManager = new StateManager();

// Check if the site is on the Whitelist on page load
stateManager.isSiteOnWhitelist()
  .then(function(isAllowed) {
    if (isAllowed) {
      stateManager.turnOn();
    }
  });

/**
 * Wait for messages from browser action.
 * @param {Object} message - Object containing a `data` and a `type` property.
 * @param {MessageSender} sender - Information about the Script context.
 * @param {function} sendResponse - Function to call when a response is received.
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
  case 'json':
    registerTestSuites(message.data);
    break;
  case 'on-off':
    if (message.data === 'on') {
      stateManager.addSiteToWhitelist()
        .then(stateManager.turnOn);
    } else if (message.data === 'off') {
      stateManager.removeSiteFromWhitelist()
        .then(stateManager.turnOff);
    }
    break;
  case 'background-wake':
    sendResponse(stateManager.getIsAllowed());
    break;
  default:
    console.log('invalid message type for: %s from %s', message, sender);
    break;
  }
});

/**
 * for first load
 */
window.addEventListener('GE-on', function() {
  if (stateManager.isAllowed) {
    stateManager.turnOn();
  }
});

// inject.js<inject> ends here
