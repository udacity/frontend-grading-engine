/*global FileReader, chrome */

/**
 * @fileOverview This file contains the browser_action logic.
 * @name browser_action.js<browser_action>
 * @author Cameron Pittman
 * @author Etienne Prud’homme
 * @license GPLv3
 */

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
    alert.textContent = "Error. Cannot load file.";
    console.log(e);
  };

  if (file.type && (file.type.match('application/json') || file.type.match('text/json'))) {
    alert.textContent = "JSON found!";
    reader.readAsText(file);
  } else {
    alert.textContent = "File found";
    alert.style.color = "#a48700";
    reader.readAsText(file);
  }
};

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
};

var allowFeedback = document.querySelector('#allow-feedback');
allowFeedback.onchange = function () {
  if (!this.checked) {
    sendDataToTab('off', 'on-off');
  } else if (this.checked) {
    sendDataToTab('on', 'on-off');
  }
};

document.querySelector('#ud-file-loader').addEventListener('change', handleFileSelect, false);

/**
 * Make checkbox `checked` if the website is allowed.
 */
function checkSiteStatus () {
  // talk to background script
  sendDataToTab(true, 'background-wake', function (response) {
    if (response) {
      allowFeedback.checked = true;
    }
  });
};

function initDisplay() {
  var configs = document.getElementById('configs');
  configs.addEventListener('click', function handler(event) {
    chrome.runtime.openOptionsPage();
  });
}

checkSiteStatus();
initDisplay();

// browser_action.js<browser_action> ends here
