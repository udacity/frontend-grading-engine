/*global removeFileNameFromPath, injectIntoDocument, chrome, StateManager, debugStatus, appendIDToURL */

/**
 * @fileoverview This file manages the injection of several JavaScript
 * files. It contains most procedure for injecting those files, but
 * doesn’t handle the conditional injection part.
 * @name inject.js<inject>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

/**
 * List of items id that were injected in the page. It is used to
 * later remove them.
 * @type {string[]}
 */
var injectedElementsOnPage = [];
var debugMode = false;

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
    return Promise.resolve({
      status: 'components_already_loaded_exception'
    });
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
    return Promise.resolve({
      status: 'widget_already_loaded_exception'
    });
  }
}

/**
 * Inject the Grading Engine inside the current Document.
 * @returns {Promise}
 */
function injectGradingEngine() {
  var ge = document.querySelector('script#udacity-front-end-feedback');

  if(!ge) {
    return injectIntoDocument('script', {
      src: chrome.extension.getURL('app/js/libs/GE.js'),
      id: 'udacity-front-end-feedback'
    }, 'head');
  } else {
    return Promise.resolve({
      status: 'grading_engine_already_loaded_exception'
    });
  }
}

/**
 * Load custom libraries for the Grading Engine
 * (i.e. jsgrader.js). Currently only `jsgrader.js` is supported and
 * allowed in the manifest.
 * @returns {Promise}
 */
function loadLibraries() {
  return new Promise(function(resolve, reject) {
    var libraries = null;
    var loadedLibs = 0;

    if(!metaTag) {
      // XXX: Reject?
      resolve({
        status: 'no_meta_tag_exception',
        message: 'Couldn’t find a valid test file to load automatically'
      });
    }

    libraries = metaTag.getAttribute('libraries');
    if(!libraries) {
      return resolve({
        status: 'no_library_specified_exception'
      });
    }

    libraries = libraries.split(' ');
    return Promise.all(
      libraries.map(function(lib) {
        return injectIntoDocument('script', {
          src: chrome.extension.getURL('app/js/libs/' + lib + '.js')
        }, 'head');
      })).then(function() {
        resolve({
          status: 0
        });
      }).catch(function(error) {
        reject({
          status: 'error_loading_library_exception',
          message: error
        });
      });
  });
}

/**
 * Loads asynchronously the JSON file containing the tests.
 * @returns {Promise}
 */
function loadJSONTestsFromFile() {
  return new Promise(function(resolve, reject) {
    if(!metaTag) {
      return resolve({
        status: 'no_meta_tag_exception',
        message: 'Couldn’t find a valid test file to load automatically'
      });
    }

    if(!stateManager.hasLocalFileAccess && stateManager.type === 'local') {
      return resolve({
        status: 'chrome_local_exception'
      });
    }

    // http://stackoverflow.com/a/14274828
    var xmlhttp = new XMLHttpRequest();
    // The complete path to the document excluding the file name
    // (http://example.com/mydir/ for http://example.com/mydir/file.html)
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
          reject({
            status: 'unknown_protocol_exception',
            message: 'Unknown URL protocol. Supported protocols ' +
              'are: http, https and (local) file'
          });
        }
      } else {
        // it’s probably a relative path (may be garbage)
        url = documentBase + url;
      }
    }

    url = appendIDToURL(url);

    // Extract the file path (http://example.com/mydir/ for
    // http://example.com/mydir/file.html)
    fileBase = url.substr(0, url.lastIndexOf('/') + 1);

    if(fileBase !== documentBase) {
      reject({
        status: 'invalid_origin_exception',
        message: 'The test file doesn’t have the same origin as ' +
          'the document'
      });
    }

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
        // DANGER! Checks if that it wasn’t a redirection
        if(xmlhttp.responseURL !== url) {
          reject({
            status: 'redirection_exception',
            message: 'The test file request received a ' +
              'redirection. Possible cross-origin request attempt'
          });
        }
        resolve({
          status: 0,
          message: xmlhttp.responseText
        });
      } else if (xmlhttp.status >= 400) {
        reject({
          status: 'http_error_code_exception',
          message: 'The test file request returned an HTTP error'
        });
      }
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  });
}

/**
 * Check the validity of the JSON data to inject.
 * @param {Object} data - An {@link Object} containing the following
 * properties:
 * @param {int|String} data.status - The status code of the last
 * Promise or a title for the error. Any other value than 0 is
 * considered an error/exception.
 * @param {String} data.message - JSON containing tests that will be
 * registered with {@link registerTestSuites}.
 * @returns {Promise} A {@link Promise} that resolve if the data is
 * valid JSON or reject with a custom status code.
 */
function checkJSONValidity(data) {
  return new Promise(function(resolve, reject) {
    var json = data.message;
    var status = data.status;

    if(status !== 0) {
      reject(data);
    }

    if (!json) {
      // This is not a fatal exception.
      return reject({
        status: 'no_json_data_provided_exception'
      });
    }

    try {
      // Validating the JSON.
      JSON.parse(json);
      // Stringify the JSON to inject it in the page
      json = JSON.stringify(json);
    } catch(error) {
      if (json.indexOf('\\') !== -1) {
        reject({
          status: 'regex_escape_characters_exception',
          message: 'Are you trying to use “\\” in a RegEx? ' +
            'Try using \\\\ instead'
        });
      } else {
        reject({
          status: 'invalid_json_exception',
          message: 'Invalid JSON file format'
        });
      }
    }
    resolve({
      status: 0,
      message: json
    });
  });
}

function waitForFileInput(status) {
  window.addEventListener('ud-content-script-proxy', function handler(event) {
    debugger;
    var eventType = event.detail.type;
    var result = {
      status: 0,
      message: event.detail.message
    };
    // TODO

    switch(eventType) {
    case 'ud-upload-json-request':
      return checkJSONValidity(result.fileData).then(function() {
        alert('it works');
      }).catch(function(status) {
        alert('some error');
        console.log(status);
      });
      break;
    case 'ud-upload-javascript-request':
      break;
    default:
      break;
    }

  }, false);
}

// You don’t have access to the GE here, but you can inject a script
// into the document that does.
/**
 * Register test suites from the JSON data.
 * @param {Object} data - An {@link Object} containing the following
 * properties:
 * @param {int|String} data.status - The status code of the last
 * Promise or a title for the error. Any other value than 0 is
 * considered an error/exception.
 * @param {String} data.message - JSON containing tests for the
 * Grading Engine.
 * @returns {Promise}
 * @throws {Error} Errors about the JSON file.
 */
function registerTestSuites(data) {
  var json = data.message;
  return injectIntoDocument('script', {
    text: 'UdacityFEGradingEngine.registerSuites(' + json + ');'
  }, 'head');
}

/**
 * Checks and injects custom Unit Tests.
 * @returns {Promise}
 */
function loadUnitTests() {
  var unitTests = null;
  return new Promise(function(resolve, reject) {
    if(!metaTag) {
      return resolve({
        status: 'no_meta_tag_exception',
        message: 'Couldn’t find a valid test file to load automatically'
      });
    }
    unitTests = metaTag.getAttribute('unit-tests');

    if(!stateManager.hasLocalFileAccess && stateManager.type === 'local') {
      return resolve({
        status: 'chrome_local_exception'
      });
    }

    if (!unitTests) {
      return resolve({
        status: 'no_unit_tests_exception'
      });
    }

    return injectIntoDocument('script', {
      src: unitTests,
      defer: 'defer'
    });
  });
}

/**
 * Activates the Grading Engine by injecting itself in the Document. Not to be
 * confused with {@link StateManager.turnOn}. This method is called from {@link
 * StateManager~runLoadSequence}.
 * @returns {Promise}
 */
function turnOnGA() {
  return injectIntoDocument('script', {
    id: 'ud-grader-options',
    // Reviewer: Because we need to access the window script context, it’s
    // necessary to inject the script that way. A content-script doesn’t have
    // access to the window scripting context.
    innerHTML: 'UdacityFEGradingEngine.turnOn();'
  }, 'head');
}

/**
 * Stops {@link StateManager~runLoadSequence} until all tests are loaded. This
 * is necessary because the Grading Engine is activated thought the page
 * context. It isn’t a content script like this file.
 * @todo Add a timeout. If (for some reason) the event is never fired, it would
 * probably block the widget.
 * @returns {Promise} A `Promise` that fulfills when all tests are loaded
 */
function waitForTestRegistrations() {
  return new Promise(function(resolve, reject) {
    window.addEventListener('tests-registered', function(data) {
      return resolve({
        status: 0
      });
    });
  });
}

// StateManager() was here

var stateManager = new StateManager();

/**
 * Wait for messages from browser action.
 * @param {Object} message - Object containing a `data` and a `type` property.
 * @param {MessageSender} sender - Information about the Script context.
 * @param {function} sendResponse - Function to call when a response is
 * received.
 */
chrome.runtime.onMessage.addListener(function handler(message, sender, sendResponse) {
  function sendStatus(value) {
    if(debugMode === true) {
      debugStatus(value);
    }
    sendResponse(value);
  }

  var response = {
    status: undefined,
    message: ''
  };
  switch (message.type) {
  case 'allow':
    if (message.data === 'on') {
      stateManager.allowSite();
      stateManager.turnOn();
    } else if (message.data === 'off') {
      stateManager.disallowSite();
      stateManager.turnOff();
    }
    break;
  case 'json':
    // A JSON test file was passed to the action page
    // registerTestSuites(message.data);
    break;
  case 'whitelist':
    // The action page checkbox was toggled
    if (message.data === 'add') {
      stateManager.addSiteToWhitelist()
        .catch(sendStatus);
    } else if (message.data === 'remove') {
      stateManager.removeSiteFromWhitelist()
        .catch(sendStatus);
    } else if (message.data === 'get') {
      stateManager.isSiteOnWhitelist()
        .then(sendStatus)
        .catch(sendStatus);
    }
    break;
  case 'background-wake':
    // The action page is requesting infos about the current host
    stateManager.getIsAllowed()
      .then(sendStatus)
      .catch(sendStatus);
    break;
  default:
    // Just in case of future bad implementation
    console.warn('Invalid message type for: %s from %s', message, sender);
    // This could be anything, therefore it’s an unknown error
    sendStatus(undefined);
    break;
  }
  return true;
});

// /**
//  * for first load (Is it ever called?)
//  */
// window.addEventListener('GE-on', function() {
//   if (stateManager.getIsAllowed()) {
//     stateManager.turnOn();
//   }
// });

// Check if the site is on the Whitelist on page load
stateManager.isSiteOnWhitelist()
  .then(function(value) {
    if (value.message === true) {
      stateManager.turnOn();
    }
  }).catch(debugStatus);

// inject.js<inject> ends here
