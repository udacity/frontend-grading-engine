/*global chrome */

/**
 * @fileOverview This file contains the option page for adding/removing websites from the whitelist.
 * @name options.js<options>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

var wlSites = document.querySelector('#wl-sites');
var removeSitesDatalist = document.querySelector('#remove-site');
var siteToAdd = document.querySelector('input#add-site');
var siteToRemove = document.querySelector('#site-to-remove');

var originWhitelist = document.querySelector('#origin-whitelist');
var localWhitelist = document.querySelector('#local-whitelist');

var isChromium = window.navigator.vendor.toLocaleLowerCase().indexOf('google') !== -1;

function StateManager() {
  this.whitelist = [];
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
        self.whitelist = response.whitelist;
        if (!(self.whitelist instanceof Array)) {
          self.whitelist = [self.whitelist];
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
      var index = self.whitelist.indexOf(site);
      if (index === -1) {
        self.whitelist.push(site);
      }
      self.isAllowed = true;
      var data = {whitelist: self.whitelist};
      chrome.storage.sync.set(data, function () {
        resolve();
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
      var index = self.whitelist.indexOf(site);
      if (index > -1) {
        self.whitelist.splice(index, 1);
      }
      self.isAllowed = false;
      var data = {whitelist: self.whitelist};
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

function newEntry(data, type) {
  var template = document.getElementById('whitelist-entry-template');
  var entry = template.cloneNode(true);
  entry.removeAttribute('id');
  entry.getElementsByClassName('entry')[0].textContent = data;
  entry.getElementsByClassName('remove-entry')[0].addEventListener('click', function handler(event) {
    event.preventDefault();
    entry.parentElement.removeChild(entry);
    window.dispatchEvent(new CustomEvent('remove', {detail: {type: type, data: data}}));
  });
  return entry;
}

function newOriginEntry(url) {
  originWhitelist.appendChild(newEntry(url, 'origin'));
}

function chromiumInit() {
  if(isChromium) {
    var localPlaceholder = document.querySelector('#local-whitelist td .whitelist-message');
    localPlaceholder.textContent = 'Chrome doesn’t support loading local files asynchronously. You must manually load the test file. Sorry for the inconvenience ';
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
