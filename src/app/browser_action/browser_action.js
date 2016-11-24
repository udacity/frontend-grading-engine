/*global FileReader, chrome */

/**
 * @fileOverview This file contains the browser_action logic.
 * @name browser_action.js<browser_action>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

// Utilities
HTMLElement.prototype.height = function(height) {
  this.style.height = height + 'px';
};

HTMLElement.prototype.super = HTMLElement.prototype;

HTMLElement.prototype.expand = function() {
  var inner = this.getElementsByClassName('expand-inner')[0];

  if(inner) {
    var height = inner.offsetHeight;
    this.height(height);
  }
};

HTMLElement.prototype.collapse = function() {
  this.height(0);
};

HTMLElement.prototype.isCollapsed = function() {
  return this.style.height === '0px' || this.style.height === '' || this.style.height === 0;
};

HTMLInputElement.prototype.lock = function() {
  this.setAttribute('disabled', 'disabled');

  for(var i=0, len=arguments.length; i<len; i++) {
    if(arguments[i] instanceof HTMLInputElement) {
      arguments[i].lock();
    }
  }
};

HTMLInputElement.prototype.unlock = function() {
  this.removeAttribute('disabled');

  for(var i=0, len=arguments.length; i<len; i++) {
    if(arguments[i] instanceof HTMLInputElement) {
      arguments[i].unlock();
    }
  }
};
// Utilities ends here

var siteOnWhitelist;

(function() {
  var loader = document.getElementsByClassName('loader')[0];
  var allowFeedback = document.getElementById('allow-feedback');
  var fileLoader = document.getElementById('ud-file-loader');
  siteOnWhitelist = document.getElementById('site-on-whitelist');
  var blockAnimation = false;

  // TODO: Unload tests when the file input is used

  loader.lock = function() {
    HTMLInputElement.prototype.lock.call(fileLoader, siteOnWhitelist);
  };

  loader.unlock = function() {
    HTMLInputElement.prototype.unlock.call(fileLoader, siteOnWhitelist);
  };

  loader.expand = function() {
    this.super.expand.call(this);
    this.unlock();
  };

  loader.collapse = function() {
    this.super.collapse.call(this);
    this.lock();
  };

  allowFeedback.on = function() {
    this.checked = true;
    loader.expand();
  };

  allowFeedback.off = function() {
    this.checked = false;
    loader.collapse();
  };

  allowFeedback.onchange = function () {
    if (this.checked) {
      this.on();
    } else if (!this.checked) {
      this.off();
    }
  };

  siteOnWhitelist.lock = function() {
    this.setAttribute('disabled', 'disabled');
  };

  siteOnWhitelist.unlock = function() {
    this.removeAttribute('disabled');
  };

  siteOnWhitelist.on = function() {
    this.checked = true;
    allowFeedback.on();
    allowFeedback.lock();
  };

  siteOnWhitelist.off = function() {
    this.checked = false;
    allowFeedback.unlock();
  };

  siteOnWhitelist.onchange = function () {
    if (!this.checked) {
      this.off();
      sendDataToTab('off', 'whitelist');
    } else if (this.checked) {
      this.on();
      sendDataToTab('on', 'whitelist');
    }
  };

  function displayInfo(text) {
    return new Promise(function(resolve, reject) {
      var infoText = document.getElementsByClassName('info-text')[0];
      var infoBlock = document.getElementsByClassName('info-block')[0];

      function expandHandler() {
        infoBlock.removeEventListener('transitionend', expandHandler, false);
        resolve();
      }

      function collapseHandler() {
        infoBlock.removeEventListener('transitionend', collapseHandler, false);
        infoText.textContent = text;
        resolve();
      }

      function collapseExpandHandler() {
        infoBlock.removeEventListener('transitionend', collapseExpandHandler, false);
        infoBlock.addEventListener('transitionend', expandHandler, false);
        infoText.textContent = text;
        infoBlock.expand();
      }

      if (text === '') {
        infoBlock.addEventListener('transitionend', collapseHandler, false);
        infoBlock.collapse();
      } else {
        if(!infoBlock.isCollapsed()) {
          infoBlock.addEventListener('transitionend', collapseExpandHandler, false);
          infoBlock.collapse();
        } else {
          infoBlock.addEventListener('transitionend', expandHandler, false);
          infoText.textContent = text;
          infoBlock.expand();
        }
      }
    });
  }

  function infoTitle(event) {
    var target = event.target;
    var expandedClass = 'info-title-expanded';
    var isInfoTitle = target.classList.contains('info-title');
    var oldTarget = document.getElementsByClassName(expandedClass)[0];
    oldTarget = oldTarget && oldTarget === target ? null : oldTarget;
    var title = document.getElementsByClassName('info-text')[0].textContent;

    if(blockAnimation === true) {
      if(isInfoTitle === true) {
        event.preventDefault();
      }
      return;
    }

    if (isInfoTitle === true) {
      event.preventDefault();
      title = target.title || '';

      if (target.classList.contains(expandedClass)) {
        title = '';
        target.classList.remove(expandedClass);
      } else {
        target.classList.add(expandedClass);
      }
    } else {
      if(title === '') {
        return;
      }
      // Clicked somewhere else
      title = '';
    }
    if (oldTarget) {
      oldTarget.classList.remove(expandedClass);
    }

    blockAnimation = true;
    displayInfo(title).then(function() {
      blockAnimation = false;
    });
  }

  /**
   * Adds the gear EventListener for opening configurations.
   */
  function initDisplay() {
    var configs = document.getElementById('configs');
    configs.addEventListener('click', function handler() {
      chrome.runtime.openOptionsPage();
    });

    var infoTitles = document.getElementsByClassName('info-title');
    for(var i = 0, len = infoTitles.length; i<len; i++) {
      infoTitles[i].active = false;
    }
    window.addEventListener('click', infoTitle, false);
  }

  // Firefox dev edition seems to load a browser action script asynchronously (while having the async property set to false). Pretending it’s not a bug, that may be a workaround for future Firefox releases.
  window.addEventListener('DOMContentLoaded', function(event) {
    checkSiteStatus();
    initDisplay();
  });
}());


// http://html5rocks.com/en/tutorials/file/dndfiles/
/**
 * This function DOESN’T WORK because the browser action closes when the window looses focus. Handle the Drag-and-drop of custom JSON files.
 * @param {DragEvent} evt - The Drag-and-drop event.
 */
function handleFileSelect(evt) {
  var files = evt.target.files;
  var file = files[0];
  var reader = new FileReader();
  var alert = document.querySelector('.alert');
  alert.style.display = 'block';

  reader.onload = function (file) {
    sendDataToTab(file.target.result, 'json');
  };

  reader.onerror = function (e) {
    alert.style.display = 'block';
    alert.textContent = 'Error. Cannot load file.';
    console.log(e);
  };

  if (file.type && (file.type.match('application/json') || file.type.match('text/json'))) {
    alert.textContent = 'JSON found!';
    reader.readAsText(file);
  } else {
    alert.textContent = 'File found';
    alert.style.color = '#a48700';
    reader.readAsText(file);
  }
}

/**
 * Custom function for sending messages to the current tab.
 * @param {*} data - Any message or data that can be serialized
 * @param {string} type - The type of the message.
 * @param {function} [callback] - The function that will receive the response.
 */
function sendDataToTab(data, type, callback) {
  // debugger;
  // get the current tab then send data to it
  chrome.tabs.query({active: true, currentWindow: true}, fireOffData);

  // actually post data to a tab
  /**
   * Sends the message to the current tab.
   * @param {chrome.tabs.Tab[]} arrayOfTabs - An array of tabs.
   */
  function fireOffData (arrayOfTabs) {
    var activeTab = arrayOfTabs[0];
    var activeTabId = activeTab.id;
    var message = {'data': data, 'type': type};
    chrome.tabs.sendMessage(activeTabId, message, {}, function (response) {
      if (callback) {
        callback(response);
      }
    });
  }
}

document.querySelector('#ud-file-loader').addEventListener('change', handleFileSelect, false);

/**
 * Adds a custom warning message and disable the checkbox.
 * @param {string} message - The custom message.
 * @param {string} type - The type of warning.
 * @param {object} options - Object containing options.
 * @param {bool} options.enableCheckbox - When using the `checkbox`,
 * {@link type}, it enables toggling the checkbox. Otherwise it does nothing.
 * @param {bool} options.checked - When using the `checkbox` {@link type}, it
 * checks the checkbox. Otherwise it does nothing.
 * @param {bool} options.removeFileInput - When using the `fileInput`
 * {@link type}, it removes the file input.
 * @param {bool} options.disableFileInput - When using the `fileInput`,
 * {@link type}, it disables the file input.
 */
function addWarning(message, type, options) {
  options = options || {};

  var fileInput, label;
  var form = document.getElementsByClassName('autorun')[0];
  document.getElementById('warning-text').textContent = message;
  document.getElementsByClassName('warning-block')[0].style.display = 'block';

  if(type === 'disable') {
    document.getElementsByClassName('loader')[0].remove();
  } else if(type === 'checkbox') {
    if(options.enableCheckbox !== true) {
      form.classList.add('disabled');
      siteOnWhitelist.disabled = true;
    }
    if(options.checked === true) {
      siteOnWhitelist.checked = true;
    }
  } else if(type === 'fileInput') {
    fileInput = document.getElementById('ud-file-loader');

    if(options.removeFileInput === true) {
      label = document.getElementById('ud-label-loader');
      label.remove();
    } else if(options.disableFileInput === true) {
      fileInput.disabled = false;
    } else {
      label = document.getElementById('ud-label-loader');
      label.classList.add('disabled');
      fileInput.disabled = true;
    }
  }
}

/**
 * Makes checkbox `checked` if the website is allowed.
 */
function checkSiteStatus () {
  // talk to background script
  sendDataToTab(true, 'background-wake', function (response) {
    switch(response) {
    case true:
      siteOnWhitelist.on();
      break;
    case false:
      siteOnWhitelist.off();
      break;
    case 'chrome_local_exception':
      addWarning('Chrome doesn’t support loading local files automatically', 'checkbox', {enableCheckbox: false, checked: false});
      break;
    case 'unknown_protocol':
      addWarning('Unsupported protocol. Supported protocols are: http, https and (local) file', 'checkbox', {enableCheckbox: false, checked: false});
      break;
    case 'invalid_origin':
      addWarning('The linked JSON page isn’t at the same origin and directory as the document', 'checkbox', {enableCheckbox: false, checked: false});
      break;
    case undefined:
      // response is undefined if there’s no content-script active (so it’s an unsupported URL scheme)
      addWarning('Unsupported URL scheme. Supported URL schemes are: http://, https://, or file://', 'disable', {});
      break;
    default:
      break;
    }
  });
}

// browser_action.js<browser_action> ends here
