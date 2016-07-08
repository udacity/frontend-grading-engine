/**
 * @fileOverview This file contains various functions that aren’t specific to the current extension.
 * @name helpers.js<inject>
 * @author Cameron Pittman
 * @license MIT
 */

/**
 * Adds elements to the main page.
 * @param  {String} tag       Type of element
 * @param  {Object} data      Key/value pairs you want to be assigned to as newTag[key] = value
 * @param  {Object} [location]  Set to “head” if you want the element to end up there. Default is body
 * @return {Promise}
 */
function injectIntoDocument(tag, data, location) {
  // debugger;
  location = location || 'body';
  return new Promise(function(resolve, reject) {
    var newTag = document.createElement(tag);
    // Firefox fix because it considers dynamically injected scripts as async
    if(tag === 'script') {
      newTag.async = false;
    }

    if (data) {
      for (a in data) {
        newTag[a] = data[a];
      }
    }

    if (!newTag.id) {
      newTag.id = 'ud-' + Math.floor(Math.random() * 100000000).toString();
    }
    // for later removal
    injectedElementsOnPage.push(newTag.id);

    newTag.onload = function(e) {
      resolve(e);
    };
    newTag.onerror = function(e) {
      reject(e);
    };
    if (tag === 'script' && !newTag.src && (newTag.text || newTag.innerHTML)) {
      resolve();
    }
    if (location === 'head') {
      document.head.appendChild(newTag);
    } else {
      document.body.appendChild(newTag);
    };
  });
}

// helpers.js<inject> ends here
