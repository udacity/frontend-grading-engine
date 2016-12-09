/*global chrome */

/**
 * @fileOverview This file contains the browser_action logic.
 * @name browser_action.js<browser_action>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license MIT
 */

// Utilities
/**
 * Expands a container according to its inner content (using `.expand-inner`)
 * that was collapsed.
 * @param {int} height
 */
HTMLElement.prototype.height = function(height) {
  this.style.height = height + 'px';
};

/**
 * Link for subclasses shadowing.
 */
HTMLElement.prototype.super = HTMLElement.prototype;

/**
 * Expands an container according to its inner content (using `.expand-inner`)
 * that was collapsed.
 */
HTMLElement.prototype.expand = function() {
  var inner = this.getElementsByClassName('expand-inner')[0];

  if(inner) {
    var height = inner.offsetHeight;
    this.height(height);
  }
};

/**
 * Sets the element Height to 0.
 */
HTMLElement.prototype.collapse = function() {
  this.height(0);
};

/**
 * Checks if the element is collapsed.
 * @returns {Boolean} True if collapsed, otherwise false.
 */
HTMLElement.prototype.isCollapsed = function() {
  return this.style.height === '0px' || this.style.height === '' || this.style.height === 0;
};

/**
 * Checks if the element is collapsed.
 * @returns {Boolean} True if expanded, otherwise false.
 */
HTMLElement.prototype.isExpanded = function() {
  return !this.isCollapsed();
};

/**
 * Disables a single or multiple `HTMLInputELement`.
 * @param {...HTMLInputElement} arguments - An other {@link HTMLInputElement} to
 * disable.
 */
HTMLInputElement.prototype.lock = function() {
  this.setAttribute('disabled', 'disabled');

  for(var i=0, len=arguments.length; i<len; i++) {
    if(arguments[i] instanceof HTMLInputElement) {
      arguments[i].lock();
    }
  }
};

/**
 * Enables a single or multiple `HTMLInputELement`.
 * @param {...HTMLInputElement} arguments - An other {@link HTMLInputElement} to
 * enable.
 */
HTMLInputElement.prototype.unlock = function() {
  this.removeAttribute('disabled');

  for(var i=0, len=arguments.length; i<len; i++) {
    if(arguments[i] instanceof HTMLInputElement) {
      arguments[i].unlock();
    }
  }
};
// Utilities ends here

(function() {
  var lastTimeError = null;

  /**
   * Custom function for sending messages to the current tab.
   * @param {*} data - Any message or data that can be serialized
   * @param {string} type - The type of the message.
   * @param {function} [callback] - The function that will receive the response.
   */
  function sendDataToTab(data, type, callback) {
    return new Promise(function(resolve) {
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
          return resolve();
        });
      }
      // get the current tab then send data to it
      chrome.tabs.query({active: true, currentWindow: true}, fireOffData);
    });
  }

  /**
   * The permanent whitelist permission.
   * @type {HTMLElement}
   */
  var loader = document.getElementsByClassName('loader')[0];

  /**
   * Temporary permission checkbox to allow the current website to use the
   * extension.
   * @type {HTMLInputElement}
   */
  var allowFeedback = document.getElementById('allow-feedback');

  // /**
  //  * Button to load a JSON test file from the local system.
  //  * @type {HTMLInputElement}
  //  */
  // var fileLoader = document.getElementById('ud-file-loader');

  /**
   * Permanent permission checkbox with the whitelist to use the extension.
   * @type {HTMLInputElement}
   */
  var siteOnWhitelist = document.getElementById('site-on-whitelist');

  /**
   * If the an {@link infoTitle} animation is happening.
   * @type {Boolean}
   */
  var blockAnimation = false;

  // TODO: Unload tests when the file input is used

  /**
   * Disables (locks) the `.loader` (file input & whitelist checkbox).
   */
  loader.lock = function() {
    HTMLInputElement.prototype.lock.call(// fileLoader,
      siteOnWhitelist);
  };

  /**
   * Enables (unlocks) the `.loader` (file input & whitelist checkbox).
   */
  loader.unlock = function() {
    HTMLInputElement.prototype.unlock.call(// fileLoader,
      siteOnWhitelist);
  };

  /**
   * Expands the loader (animation).
   */
  loader.expand = function() {
    this.super.expand.call(this);
    this.unlock();
  };

  /**
   * Collapses the loader (animation).
   */
  loader.collapse = function() {
    this.super.collapse.call(this);
    this.lock();
  };

  /**
   * Activates the temporary permission procedure.
   */
  allowFeedback.on = function() {
    this.checked = true;
    if(loader.isCollapsed()) {
      loader.expand();
    }
  };

  /**
   * Deactivates the temporary permission procedure.
   */
  allowFeedback.off = function() {
    this.checked = false;
    loader.collapse();
  };

  /**
   * Calls member methods on change of state. It was previously used for the
   * permanent whitelist.
   */
  allowFeedback.onchange = function() {
    if (this.checked === true) {
      sendDataToTab('on', 'allow', getStatusMessage);
      this.on();
    } else if (this.checked === false) {
      sendDataToTab('off', 'allow', getStatusMessage);
      this.off();
    }
  };

  /**
   * Checks {@link allowFeedback} is on.
   * @returns {Boolean} True if on, otherwise false.
   */
  allowFeedback.isOn = function() {
    return this.checked;
  };

  /**
   * Checks {@link allowFeedback} is off.
   * @returns {Boolean} True if off, otherwise false.
   */
  allowFeedback.isOff = function() {
    return !this.checked;
  };

  /**
   * Locks the whitelist checkbox.
   */
  siteOnWhitelist.lock = function() {
    this.setAttribute('disabled', 'disabled');
  };

  /**
   * Unlocks the whitelist checkbox.
   */
  siteOnWhitelist.unlock = function() {
    this.removeAttribute('disabled');
  };

  /**
   * Marks the current website as in the permanent whitelist.
   */
  siteOnWhitelist.on = function() {
    if(allowFeedback.isOff()) {
      allowFeedback.on();
    }

    this.checked = true;
    allowFeedback.lock();
  };

  /**
   * Marks the current website as not in the permanent whitelist.
   */
  siteOnWhitelist.off = function() {
    this.checked = false;
    allowFeedback.unlock();
  };

  /**
   * Adds the current website to the permanent whitelist.
   */
  siteOnWhitelist.add = function() {
    this.on();
    allowFeedback.lock();
    sendDataToTab('add', 'whitelist');
  };

  /**
   * Removes the current website from the permanent whitelist.
   */
  siteOnWhitelist.remove = function() {
    this.off();
    sendDataToTab('remove', 'whitelist');
  };

  /**
   * Calls member method (on or off) on change of state.
   */
  siteOnWhitelist.onchange = function () {
    if (!this.checked) {
      this.remove();
    } else {
      this.add();
    }
  };

  /**
   * Makes `.info-block` animations and prevent the animation to fire twice.
   * @param {String} text - The text to display in the `.info-block` element.
   * @returns {Promise} A new {@link Promise} that resolves when the transition
   * finishes.
   */
  function displayInfo(text) {
    return new Promise(function(resolve) {
      var infoText = document.getElementsByClassName('info-text')[0];
      var infoBlock = document.getElementsByClassName('info-block')[0];

      /**
       * Manages the expand event for `.info-block`.
       */
      function expandHandler() {
        infoBlock.removeEventListener('transitionend', expandHandler, false);
        return resolve();
      }

      /**
       * Manages the collapse event for `.info-block`.
       */
      function collapseHandler() {
        infoBlock.removeEventListener('transitionend', collapseHandler, false);
        infoText.textContent = text;
        return resolve();
      }

      /**
       * Manages the collapse and expand event. It collapses and expands an
       * already expanded `.info-block`.
       */
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
        if(infoBlock.isExpanded()) {
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

  /**
   * Displays or hides an element `title` attribute in the `.info-box` when
   * clicked.
   * @param {Event} event - The event for the element clicked.
   */
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

  /**
   * Adds a custom warning message and disable the checkbox.
   * @param {string} message - The custom message.
   * @param {string} type - The type of warning. `Disabled` disable the
   * checkboxes and change the label color to light gray.
   * @param {object} options - Object containing options.
   * @param {bool} options.allowFeedback - Mark {@link allowFeedback} as
   * checked.
   * @param {bool} options.siteOnWhitelist - Mark {@link siteOnWhitelist} as
   * checked.
   */
  function addWarning(message, type, options) {
    options = options || {};
    var warningBlock = document.getElementsByClassName('warning-block')[0];

    document.getElementById('warning-text').textContent = message;
    warningBlock.expand();

    if(type === 'disable') {
      allowFeedback.disabled = true;
      siteOnWhitelist.disabled = true;
    }
    if(options.allowFeedback !== undefined) {
      if(options.allowFeedback === true) {
        allowFeedback.on();
      } else if(options.allowFeedback === false) {
        allowFeedback.off();
      }
    }
    if(options.siteOnWhitelist !== undefined) {
      if(options.siteOnWhitelist === true) {
        siteOnWhitelist.on();
      } else if(options.siteOnWhitelist === false) {
        siteOnWhitelist.off();
      }
    }
  }

  /**
   * Gets the the message for a status and adds a warning.
   * @param {Object} response - The status object containing the following:
   * @param {String|int} response.status - The status.
   * @param {*} response.message - Message of the status.
   */
  function getStatusMessage(response) {
    var _allowFeedback = (response.message === true);

    if(response.status === lastTimeError) {
      return;
    } else if(response !== 0) {
      // No need add the warning
      lastTimeError = response.status;
    }

    switch(response.status) {
    case 0:
      if(_allowFeedback) {
        allowFeedback.on();
      } else {
        allowFeedback.off();
      }
      break;
    case 'chrome_local_exception':
      // We don’t know (and care) for the whitelist here.
      addWarning('Chrome doesn’t support loading local files automatically. You must load the test file manually',
                 'warn',
                 {allowFeedback: _allowFeedback});
      break;
    case 'invalid_origin':
      // This is error in the document, not us or user.
      addWarning('The linked JSON page isn’t at the same origin and directory as the document',
                 'warn',
                 {allowFeedback: _allowFeedback});
      break;
    case 'unknown_protocol':
      // Shouldn’t be able to allow or even add to the whitelist.
      // break left intentionally.
    case undefined:
      // Response is undefined if there’s no content-script active (so it’s an unsupported URL scheme).
      addWarning('Unsupported URL scheme. Supported URL schemes are: http://, https://, or file://',
                 'disable',
                 {allowFeedback: false, siteOnWhitelist: false});
      break;
    default:
      debugger;
      addWarning('Unkown Error',
                 'disable',
                 {allowFeedback: false, siteOnWhitelist: false});
      break;
    }
  }
  /**
   * Makes checkboxes `checked` if the website is allowed.
   */
  function checkSiteStatus () {
    // Talk to background script.
    sendDataToTab('get', 'whitelist', function (response) {
      switch(response.message) {
      case true:
        siteOnWhitelist.on();
        break;
      case false:
        siteOnWhitelist.off();
        break;
      default:
        addWarning('Unkown Error');
        break;
      }
    }).then(function() {
      sendDataToTab(null, 'background-wake', getStatusMessage);
    });
  }

  // Firefox dev edition seems to load a browser action script asynchronously
  // (while having the async property set to false). Pretending it’s not a bug,
  // that may be a workaround for future Firefox releases.
  window.addEventListener('DOMContentLoaded', function() {
    checkSiteStatus();
    initDisplay();
  });
}());

// browser_action.js<browser_action> ends here
