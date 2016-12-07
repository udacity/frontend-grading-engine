/*global injectedElementsOnPage */

/**
 * @fileOverview This file contains various functions that aren’t specific to
 * the current extension.
 * @name helpers.js<inject>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

/**
 * Adds {@link HTMLElement} to the main page.
 * @param {String} tag Type of element
 * @param {Object} data Key/value pairs you want to be assigned to as
 * newTag[key] = value
 * @param {Object} [location] Set to “head” if you want the element to end up
 * there. Default is body
 * @return {Promise}
 */
function injectIntoDocument(tag, data, location) {
  location = location || 'body';
  return new Promise(function(resolve, reject) {
    var newTag = document.createElement(tag);
    // Firefox fix because it considers dynamically injected scripts as async
    if(tag === 'script') {
      newTag.async = false;
      newTag.setAttribute('charset', 'utf-8');
    }

    if (data) {
      for (var prop in data) {
        newTag[prop] = data[prop];
      }
    }

    if (!newTag.id) {
      newTag.id = 'ud-' + Math.floor(Math.random() * 100000000).toString();
    }

    // for later removal
    injectedElementsOnPage.push(newTag.id);

    newTag.onload = function(element) {
      return resolve(element);
    };

    newTag.onerror = function(error) {
      reject(['injection_error_exception', error]);
    };

    if (location === 'head') {
      document.head.appendChild(newTag);
    } else {
      document.body.appendChild(newTag);
    }

    if(tag === 'script' && !newTag.src && (newTag.text || newTag.innerHTML)) {
      return resolve(newTag);
    }
  });
}

/**
 * Removes all injected elements from the document.
 */
function removeInjectedFromDocument() {
  injectedElementsOnPage.forEach(function(item) {
    var element = document.getElementById(item);
    var parent;

    if(element !== null) {
      parent = element.parentNode;
      parent.removeChild(element);
    }
  });
  injectedElementsOnPage = [];
}


/**
 * Removes a single resource from {@link injectedElementsOnPage}.
 * @param {String} id - The ID of the element.
 */
function removeFromDocument(id) {
  var element = document.getElementById(id);
  var parent;
  injectedElementsOnPage.splice(injectedElementsOnPage.indexOf(id), 1);

  if(element !== null) {
    parent = element.parentNode;
    parent.removeChild(element);
  }
}

/**
 * Gets a file name from a given path and removes the hash part if
 * present. It returns the filename.
 * @param {String} path - The file path.
 * @returns {String} The filename.
 */
function getFileNameFromPath(path) {
  var _path = path.substring(path.lastIndexOf('/') + 1);

  // If there’s a hashtag present, it can simulate a path
  if(_path.indexOf('#') !== -1) {
    // Remove another URL part until there’s no hashtags
    _path = _path.substring(0, _path.indexOf('#'));
  }
  return _path;
}

/**
 * Removes a file name from a given path. It returns the basename.
 * @param {String} path - The file path.
 * @returns {String} The basename of the path.
 */
function removeFileNameFromPath(path) {
  path = path.substring(0, path.lastIndexOf('/') + 1);

  // If there’s a hashtag present, it can simulate a path
  if(path.indexOf('#') !== -1) {
    // Remove another URL part until there’s no hashtags
    path = removeFileNameFromPath(path);
  }
  return path;
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

  searchParams.set(paramName,
                   Math.floor(Math.random() * 100000000000).toString());
  return _url.toString();
}

/**
 * Get the URL in the same origin format as the document and supported
 * protocols.
 * @param {String} url - The URL in the absolute form or relative
 * form.
 * @param {bool} noCache - If the URL should get a unique ID to bypass
 * the cache (recommended).
 * @returns {Promise|String} A rejected {@link Promise} on error or
 * the correctly formatted URL.
 */
function getSameOriginURL(url, noCache) {
  // The complete path to the document excluding the file name
  // (http://example.com/mydir/ for http://example.com/mydir/file.html)
  var fileBase = '';
  var documentBase = removeFileNameFromPath(document.URL);

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
        return Promise.reject('unknown_protocol_exception');
      }
    } else {
      // it’s probably a relative path (may be garbage)
      url = documentBase + url;
    }
  }

  if(noCache) {
    url = appendIDToURL(url);
  }

  // Extract the file path (http://example.com/mydir/ for
  // http://example.com/mydir/file.html)
  fileBase = url.substr(0, url.lastIndexOf('/') + 1);

  if(fileBase !== documentBase) {
    return Promise.reject('invalid_origin_exception');
  }
  return url;
}

/**
 * Log error when on debugging mode.
 * @param {*} error - Any {@link Object} that can be serialized.
 */
function debugStatus(error) {
  if(error.status && error.message) {
    console.log('%c%s %c%s: %c“%s” at %s', 'color: black', 'DEBUG',
                'color: red; font-weight: bold', error.status,
                'font-style: italic', error.message,
                new Error().stack);
  } else {
    console.log('%c%s %c%s', 'color: black;', 'DEBUG',
                'color: red; font-weight: bold', 'Status Object:');
    console.log(error);
    console.log('at ', new Error().stack);
  }
}

// helpers.js<inject> ends here
