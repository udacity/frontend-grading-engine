/*global injectIntoDocument, chrome, StateManager, debugStatus, getSameOriginURL */

/**
 * @fileoverview This file manages the injection of several JavaScript
 * files. It contains most procedure for injecting those files, but
 * doesn’t handle the conditional injection part.
 * @name inject.js<inject>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

var debugMode = false;

// StateManager() was here

var stateManager = new StateManager();

/**
 * The meta tag that is used to load and activate a file of tests.
 * @type {Element}
 */
var metaTag = document.querySelector('meta[name="udacity-grader"]');

/**
 * Imports the Components library.
 * @returns {Promise} - A {@link Promise} that resolves when the Components
 * library was loaded.
 */
function importComponentsLibrary() {
  var cScript = document.querySelector('script#components-lib');

  if(!cScript) {
    return injectIntoDocument('script', {
      src: chrome.extension.getURL('lib/components.js'),
      id: 'components-lib'
    }, 'head');
  } else {
    return Promise.reject('components_already_loaded_exception');
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
  }

  return Promise.reject('widget_already_loaded_exception');
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
  }

  return Promise.reject('grading_engine_already_loaded_exception');
}

/**
 * Load custom libraries for the Grading Engine
 * (i.e. jsgrader.js). Currently only `jsgrader.js` is supported and
 * allowed in the manifest.
 * @returns {Promise} TODO
 */
function loadLibraries() {
  var libraries = null;
  var loadedLibs = 0;

  if(!metaTag) {
    return Promise.reject('no_meta_tag_exception');
  }
  libraries = metaTag.getAttribute('libraries');

  if(!libraries) {
    return Promise.resolve('no_library_specified_exception');
  }

  libraries = libraries.split(' ');

  return Promise.all(
    libraries.map(function(lib) {
      return injectIntoDocument('script', {
        src: chrome.extension.getURL('app/js/libs/' + lib + '.js')
      }, 'head');
    })).catch(function() {
      return Promise.reject('error_loading_library_exception');
    });
}

/**
 * Inject the file input inside the current Document.
 * @returns {Promise} TODO
 */
}

/**
 * Loads asynchronously the JSON file containing the tests.
 * @returns {Promise}
 */
function loadJSONTestsFromFile() {
  return new Promise(function(resolve, reject) {
    var url;

    if(!metaTag) {
      return reject('no_meta_tag_exception');
    }

    if(!stateManager.hasLocalFileAccess && stateManager.type === 'local') {
      // filename: getFileNameFromPath(url)
      // url = getSameOriginURL(metaTag.content);
      // filepath: removeFileNameFromPath(url),

      return reject('chrome_local_exception');
    }

    // http://stackoverflow.com/a/14274828
    var xmlhttp = new XMLHttpRequest();
    url = getSameOriginURL(metaTag.content, true);

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
        // DANGER! Checks if that it wasn’t a redirection
        if(xmlhttp.responseURL !== url) {
          return reject('redirection_exception');
        }
        return resolve(xmlhttp.responseText);
      } else if (xmlhttp.status >= 400) {
        return reject('http_error_code_exception');
      }
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  });
}

/**
 * Check the validity of the JSON data to inject.n.
 * @param {String} json - JSON containing tests that will be
 * registered with {@link registerTestSuites}.
 * @returns {Promise} A {@link Promise} that resolve if the data is
 * valid JSON or reject with a custom status code.
 */
function checkJSONValidity(json) {
  return new Promise(function(resolve, reject) {
    if (!json) {
      // This is not a fatal exception.
      return reject('no_json_data_provided_exception');
    }

    try {
      // Validating the JSON.
      JSON.parse(json);
      // Stringify the JSON to inject it in the page
    } catch(error) {
      if (json.indexOf('\\') !== -1) {
        return reject('regex_escape_characters_exception');
      }

      return reject('invalid_json_exception');
    }

    return resolve(json);
  });
}

function waitForFileInput(status) {
  window.addEventListener('ud-content-script-proxy', function handler(event) {
    var eventType = event.detail.type;
    var result = event.detail.data;

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

/**
 * TODO
 * @param {String} file.type - Either `test-file` or `unit-tests`.
 * @param {String} [file.filepath] - The filepath (basepath) of the
 * required file to prompt.
 * @param {String} [file.filename] - The filename of the required file
 * to prompt.
 */
// You don’t have access to the GE here, but you can inject a script
// into the document that does.
/**
 * Register test suites from the JSON data.
 * @param {String} data - JSON containing tests for the Grading
 * Engine.
 * @returns {Promise}
 */
function registerTestSuites(data) {
  var json = JSON.stringify(data);
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

  if(!metaTag) {
    return Promise.reject('no_meta_tag_exception');
  }

  unitTests = metaTag.getAttribute('unit-tests');

  if (!unitTests) {
    return Promise.resolve();
  }
  if(!stateManager.hasLocalFileAccess && stateManager.type === 'local') {
    return Promise.reject('chrome_local_exception');
  }

  return injectIntoDocument('script', {
    src: unitTests,
    defer: 'defer'
  });
}

/**
 * Activates the Grading Engine by injecting itself in the
 * Document. Not to be confused with {@link StateManager.turnOn}. This
 * method is called from {@link StateManager~runLoadSequence}.
 * @returns {Promise}
 */
function turnOnGA() {
  return injectIntoDocument('script', {
    id: 'ud-grader-options',
    // Reviewer: Because we need to access the window script context,
    // it’s necessary to inject the script that way. A content-script
    // doesn’t have access to the window scripting context.
    innerHTML: 'UdacityFEGradingEngine.turnOn();'
  }, 'head');
}

/**
 * Stops {@link StateManager~runLoadSequence} until all tests are
 * loaded. This is necessary because the Grading Engine is activated
 * thought the page context. It isn’t a content script like this file.
 * @todo Add a timeout. If (for some reason) the event is never fired,
 * it would probably block the widget.
 * @returns {Promise} A `Promise` that fulfills when all tests are
 * loaded
 */
function waitForTestRegistrations() {
  return new Promise(function(resolve, reject) {
    window.addEventListener('tests-registered', function(data) {
      return resolve();
    });
  });
}

/**
 * Wait for messages from browser action.
 * @param {Object} message - Object containing a `data` and a `type` property.
 * @param {MessageSender} sender - Information about the Script context.
 * @param {function} sendResponse - Function to call when a response is
 * received.
 */
chrome.runtime.onMessage.addListener(function handler(message, sender, sendResponse) {
  /**
   * Utility function to send back response with a status. If
   * {value.status} isn’t present, it sends a status of 0.
   * @param {Object[]} value - The value to send back.
   */
  function sendStatus(value) {
    var _value = {};

    if(!value || value[0] === undefined) {
      _value = {
        status: 0,
        // Necessary if it’s a falsy value
        message: value
      };
    } else if(Object.prototype.toString.call(value) === '[object String]') {
      _value = {
        status: value
      };
    } else if(value[1] === undefined) {
      _value = {
        status: 0,
        message: value[0]
      };
    } else {
      _value = {
        status: value[0],
        message: value[1]
      };
    }

    if(debugMode === true) {
      debugStatus(_value);
    }
    sendResponse(_value);
  }

  switch (message.type) {
  case 'allow':
    if (message.data === 'on') {
      stateManager.allowSite()
        .then(stateManager.turnOn)
        .then(sendStatus, sendStatus);
    } else if (message.data === 'off') {
      stateManager.disallowSite()
        .then(stateManager.turnOff)
        .then(sendStatus, sendStatus);
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
    if(value === true) {
      stateManager.turnOn();
    }
  })
  .catch(debugStatus);

// inject.js<inject> ends here
