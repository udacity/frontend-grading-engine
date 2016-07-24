/*global chrome */

/**
 * @fileOverview This file contains the option page for adding/removing websites from the whitelist.
 * @name options.js<options>
 * @author Cameron Pittman
 * @license GPLv3
 */

var wlSites = document.querySelector('#wl-sites');
var removeSitesDatalist = document.querySelector('#remove-site');

var siteToAdd = document.querySelector('input#add-site');
var siteToRemove = document.querySelector('#site-to-remove');

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

var stateManager = new StateManager();
stateManager.getWhitelist()
.then(refreshDisplay);

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

// options.js<options> ends here
