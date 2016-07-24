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
  addSiteToWhitelist: function(site) {
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
  removeSiteFromWhitelist: function(site) {
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

function refreshDisplay() {
  siteToAdd.value = '';

  removeSitesDatalist.textContent = '';
  siteToRemove.value = '';

  stateManager.whitelist.forEach(function (val) {
    var o = document.createElement('option');
    o.for = "remove-site";
    o.value = val;
    removeSitesDatalist.appendChild(o);
  });
  if (stateManager.whitelist.length > 0) {
    wlSites.textContent = stateManager.whitelist.join(', ');
  };
};

function _refreshDisplay() {
  var whitelist = stateManager.whitelist;
  var isEmpty = true, whitelistElem;

  for(var i=0, len=whitelist.length; i<len; i++) {
    if(whitelist[i]) {
      newOriginEntry(whitelist[i]);
      isEmpty = false;
    }
  }

  if(!isEmpty) {
    whitelistElem = document.getElementById('origin-whitelist');
    whitelistElem.removeChild(whitelistElem.getElementsByClassName('whitelist-placeholder')[0]);
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
  .then(_refreshDisplay)
  .then(chromiumInit);

siteToAdd.onkeyup = function(e) {
  if (e.keyCode === 13) {
    var site = siteToAdd.value;
    stateManager.addSiteToWhitelist(site)
      .then(refreshDisplay);
  }
};

siteToRemove.onkeyup = function(e) {
  if (e.keyCode === 13) {
    var site = siteToRemove.value;
    stateManager.removeSiteFromWhitelist(site)
      .then(refreshDisplay);
  }
};

window.addEventListener('remove', function handler(event) {
  stateManager.removeSiteFromWhitelist(event.detail.data);
}, false);

// options.js<options> ends here
