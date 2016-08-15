/*global chrome, browserName */

/**
 * @fileOverview This file contains the option page for adding/removing websites from the whitelist.
 * @name options.js<options>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 * @todo remove trailing / from URLs
 */

var remoteWhitelist = document.querySelector('#remote-whitelist');
var localWhitelist = document.querySelector('#local-whitelist');
var isChromium = window.navigator.vendor.toLocaleLowerCase().indexOf('google') !== -1;

function StateManager() {
  this.whitelist = {remote: [], local: []};
};

StateManager.prototype = {
  /**
   * Get the whitelist from the storage.
   * @returns {Promise} A promise that resolves when the data is received.
   */
  getWhitelist: function() {
    var self = this;
    return new Promise(function (resolve, reject) {
      chrome.storage.sync.get('whitelist', function (response) {
        self.whitelist = response.whitelist || {remote: [], local: []};

        if (!(self.whitelist.remote instanceof Array ||
              Object.prototype.toString.call(self.whitelist.remote) === '[object Array]')) {
          self.whitelist.remote = [self.whitelist.remote];
        }
        if (!(self.whitelist.local instanceof Array ||
              Object.prototype.toString.call(self.whitelist.remote) === '[object Array]')) {
          self.whitelist.local = [self.whitelist.local];
        }
        resolve(self.whitelist);
      });
    });
  },
  /**
   * Add a given site to the stored whitelist and the {@link StateManager.whitelist}.
   * @param {string} site - A URL to add to the whitelist.
   * @param {string} type - The type of site. It either be: `remote` or `local`.
   * @returns {Promise} A promise that resolves when the data is set.
   */
  addSiteToWhitelist: function(site, type) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if(type === 'remote') {
        if(site.search(/^(?:https?:)\/\/[^\s\.]/) === -1) {
          reject('The site is not a valid URL. The URL must at least contains the http:// or https:// scheme');
        }
        resolve();
      } else if(type === 'local') {
        if(site.search(/^file:\/\/\/?[^\s\.]/) === -1) {
          reject('The site is not a valid local URL. The URL must at least contains the file:// scheme');
        }
        resolve();
      } else {
        reject('type');
      }}).then(function() {

        var index = self.whitelist[type].indexOf(site);
        if (index === -1) {
          self.whitelist[type].push(site);
        }
        self.isAllowed = true;
        var data = {whitelist: {remote: self.whitelist.remote, local: self.whitelist.local}};
        chrome.storage.sync.set(data, function () {
          Promise.resolve();
        });
      });
  },
  /**
   * Remove a given site from the stored whitelist and the {@link StateManager.whitelist}.
   * @param {string} site - A URL to remove from the whitelist.
   * @param {string} type - The type of site. It either be: `remote` or `local`.
   * @returns {Promise} A promise when the data is set.
   */
  removeSiteFromWhitelist: function(site, type) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if(type !== 'remote' && type !== 'local') {
        reject('type');
      }

      var index = self.whitelist[type].indexOf(site);
      if (index > -1) {
        self.whitelist[type].splice(index, 1);
      }
      self.isAllowed = false;
      var data = {whitelist: {remote: self.whitelist.remote, local: self.whitelist.local}};
      chrome.storage.sync.set(data, function () {
        resolve();
      });
    });
  }
};

/**
 * Adds buttons to add entries.
 */
function initDisplay() {
  var manifest = chrome.runtime.getManifest();
  var extensionVersion = document.getElementById('extension-version');
  extensionVersion.textContent = manifest.version;
  document.getElementById('browser-name').textContent = browserName;

  var remoteAdd = document.getElementById('remote-add');
  remoteAdd.addEventListener('click', function handler(event) {
    newInputEntry('remote');
  });

  var localAdd = document.getElementById('local-add');
  if(localAdd !== null) {
    localAdd.addEventListener('click', function handler(event) {
      newInputEntry('local');
    });
  }
}

/**
 * Removes entries from the whitelist table.
 */
function cleanDisplay() {
  var entryCollection = document.getElementsByClassName('whitelist-row');
  var entries = [], i, len;

  // An HTMLCollection would remove its item if we used
  // `entryCollection[i].remove()` thus decreasing the lenght. That’s why we
  // convert the collection to an Array
  for(i=0, len=entryCollection.length; i<len; i++) {
    if(entryCollection[i].id !== 'whitelist-entry-template') {
      entries.push(entryCollection[i]);
    }
  }

  for(i=0, len=entries.length; i<len; i++) {
    entries[i].remove();
  }
}

/**
 * Updates the whitelist table.
 */
function refreshDisplay() {
  cleanDisplay();

  refreshSection('remote');
  refreshSection('local');

  function refreshSection(type) {
    var whitelist = stateManager.whitelist[type];
    var isEmpty = true,
        newTypeEntry = type === 'remote' ? newRemoteEntry : newLocalEntry,
        whitelistElem;

    for(var i=0, len=whitelist.length; i<len; i++) {
      if(whitelist[i]) {
        newTypeEntry(whitelist[i]);
        isEmpty = false;
      }
    }

    var placeholderDisplay = isEmpty ? 'table-row' : 'none';
    whitelistElem = document.getElementById(type + '-whitelist');
    whitelistElem.getElementsByClassName('whitelist-placeholder')[0].style.display = placeholderDisplay;
  }
}

/**
 * Return a new entry for the whitelist created from a template. The entry should isn’t attached to the document.
 * @param {string} data - The text node of the entry (`.entry`).
 * @param {string} type - The type of entry. It either be: `add-entry`, `remote` or `local`.
 * @returns {HTMLElement} The newly created entry.
 */
function newEntry(data, type) {
  var template = document.getElementById('whitelist-entry-template');
  var entry = template.cloneNode(true);
  entry.removeAttribute('id');

  if(type === 'add-entry') {
    entry.id = 'add-entry';
  }

  entry.getElementsByClassName('entry')[0].textContent = data;
  entry.getElementsByClassName('remove-entry')[0].addEventListener('click', function handler(event) {
    event.preventDefault();
    entry.remove();
    window.dispatchEvent(new CustomEvent('remove', {detail: {type: type, data: data}}));
  });
  return entry;
}

/**
 * Adds and attach a new entry in the **remote** section of the whitelist table.
 * @param {string} url - The URL (text) of the entry.
 * @returns {HTMLElement} A reference to the newly attached element.
 */
function newRemoteEntry(url) {
  return remoteWhitelist.appendChild(newEntry(url, 'remote'));
}

/**
 * Adds and attach a new entry in the **local** section of the whitelist table.
 * @param {string} url - The URL (text) of the entry.
 * @returns {HTMLElement} A reference to the newly attached element.
 */
function newLocalEntry(url) {
  return localWhitelist.appendChild(newEntry(url, 'local'));
}

/**
 * Creates an new empty entry with a text input to fill and remove an existing one if already present.
 * @param {string} type - The type of entry for the whitelist. It can either be: `local` or `remote`
 * @todo
 */
function newInputEntry(type) {
  var emptyEntry = document.getElementById('add-entry');

  if(emptyEntry !== null) {
    emptyEntry.remove();
  }

  var input = document.createElement('input');
  emptyEntry = newEntry('', 'add-entry');

  if(type === 'local') {
    // TODO: How to handle directories?
    input.className = 'local-add-input';
    emptyEntry = localWhitelist.appendChild(emptyEntry);
  } else if(type === 'remote') {
    emptyEntry = remoteWhitelist.appendChild(emptyEntry);
    input.className = 'remote-add-input';
  } else {
    throw new TypeError('The type argument isn’t valid');
  }

  // Actually attach the input
  emptyEntry.getElementsByClassName('entry')[0].appendChild(input);

  // TODO: Check correct values
  input.addEventListener('keyup', function handler(event) {
    if (event.keyCode === 13) {
      if(event.target.value) {
        var site = event.target.value;
        stateManager.addSiteToWhitelist(site, type)
          .then(refreshDisplay)
          .then(function() {
            emptyEntry.remove();
          })
          .catch(function(message) {
            if(message === 'type') {
              message = 'Unknown error';
            }
            // TODO: Implement something less annoying
            window.alert(message);
          });
      }
    }
  }, false);
  input.focus();
  // console.log(emptyEntry);
}

/**
 * Adds a warning to Chromium/Chrome users that loading a local file can’t work without doing it manually.
 */
function chromiumInit() {
  if(isChromium) {
    var localPlaceholder = document.querySelector('#local-whitelist td .whitelist-message');
    localPlaceholder.textContent = 'Chrome doesn’t support loading local files asynchronously. You must manually load the test file. Sorry for the inconvenience ';
    localPlaceholder.parentElement.classList = localPlaceholder.parentElement.classList + ' chromium-message';
    // Removes the plus sign
    document.getElementById('local-add').remove();
  }
}

var stateManager = new StateManager();
stateManager.getWhitelist()
  .then(refreshDisplay)
  .then(initDisplay)
  .then(chromiumInit);

window.addEventListener('remove', function handler(event) {
  stateManager.removeSiteFromWhitelist(event.detail.data, event.detail.type);
  refreshDisplay();
}, false);

// options.js<options> ends here
