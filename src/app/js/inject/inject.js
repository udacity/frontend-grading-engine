/*global removeFileNameFromPath, injectIntoDocument, chrome, StateManager */

/**
 * @fileoverview This file manages the injection of several JavaScript files. It contains most procedure for injecting those files, but doesn’t handle the conditional injection part.
 * @name inject.js<inject>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

/**
 * List of items id that were injected in the page. It is used to later remove them.
 * @type {string[]}
 */
var injectedElementsOnPage = [];

var runtimeError = null;

/**
 * The meta tag that is used to load and activate a file of tests.
 * @type {Element}
 */
var metaTag = document.querySelector('meta[name="udacity-grader"]');

function importComponentsLibrary() {
  var cScript = document.querySelector('script#components-lib');

  if(!cScript) {
    return injectIntoDocument('script', {
      src: chrome.extension.getURL('lib/components.js'),
      id: 'components-lib'
    }, 'head');
  } else {
    return Promise.resolve();
  }
}

/**
 * Finds Web Components templates.
 * @returns {Promise}
 */
function importFeedbackWidget() {
  var twScript = document.querySelector('script#udacity-test-widget');

  if (!twScript) {
    return injectIntoDocument('script', {
      src: chrome.extension.getURL('app/templates/templates.js'),
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
 * Load custom libraries for the Grading Engine (i.e. jsgrader.js). Currently only `jsgrader.js` is supported and allowed in the manifest.
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
 * Adds a unique GET ID in order to make the browser ignore the cache.
 * @param {String} url - A valid absolute URL.
 * @returns {String} The absolute URL and a unique GET ID.
 */
function appendIDToURL(url) {
  var _url = new URL(url);
  var searchParams = _url.searchParams;
  var paramName = 'udacityNoCache';

  while(searchParams.has(paramName)) {
    paramName += Math.floor(Math.random() * 10).toString();
  }

  searchParams.set(paramName, Math.floor(Math.random() * 100000000000).toString());
  _url.searchParams = searchParams.toString;
  return _url.toString();
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
      // The complete path to the document excluding the file name (http://example.com/mydir/ for http://example.com/mydir/file.html)
      var documentBase = removeFileNameFromPath(document.URL);
      var url = metaTag.content;
      var fileBase = '';

      // If it’s not an absolute URL
      if(url.search(/^(?:https?|file):\/\//) === -1) {
        // If it’s protocol relative URL (i.e. //example.com)
        if(url.search(/^\/\//) !== -1) {
          // The window must at least use one of those protocols
          switch(window.location.protocol) {
          case 'http:':
          case 'https:':
          case 'file:':
            url = window.location.protocol + url;
            break;
          default:
            runtimeError = 'unknown_protocol';
            console.warn('Unknown URL protocol. Supported protocols are: http, https and (local) file');
            reject(false);
          }
        } else {
          // it’s probably a relative path (may be garbage)
          url = documentBase + url;
        }
      }

      url = appendIDToURL(url);

      // Extract the file path (http://example.com/mydir/ for http://example.com/mydir/file.html)
      fileBase = url.substr(0, url.lastIndexOf('/') + 1);

      if(fileBase !== documentBase) {
        runtimeError = 'invalid_origin';
        console.warn('Invalid JSON file origin');
        reject(false);
      }

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
          // DANGER! Checks if that it wasn’t a redirection
          if(xmlhttp.responseURL !== url) {
            runtimeError = 'redirection';
            console.warn('The JSON request received a redirection. Possible cross-origin request attempt');
            reject(false);
          }
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
    // Reviewer: Because we need to access the window script context, it’s
    // necessary to inject the script that way. A content-script doesn’t have
    // access to the window scripting context.
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

/**
 * Wait for messages from browser action.
 * @param {Object} message - Object containing a `data` and a `type` property.
 * @param {MessageSender} sender - Information about the Script context.
 * @param {function} sendResponse - Function to call when a response is received.
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
  case 'json':
    // A JSON test file was passed to the action page
    registerTestSuites(message.data);
    break;
  case 'on-off':
    // The action page checkbox was toggled
    if (message.data === 'on') {
      stateManager.addSiteToWhitelist()
        .then(stateManager.turnOn);
    } else if (message.data === 'off') {
      stateManager.removeSiteFromWhitelist()
        .then(stateManager.turnOff);
    }
    break;
  case 'background-wake':
    if(runtimeError) {
      sendResponse(runtimeError);
    }
    // The action page is requesting infos about the current host
    sendResponse(stateManager.getIsAllowed());
    break;
  default:
    // Just in case of future bad implementation
    console.warn('invalid message type for: %s from %s', message, sender);
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

// Check if the site is on the Whitelist on page load
stateManager.isSiteOnWhitelist()
  .then(function(isAllowed) {
    if (isAllowed) {
      stateManager.turnOn();
    }
  });

// inject.js<inject> ends here
