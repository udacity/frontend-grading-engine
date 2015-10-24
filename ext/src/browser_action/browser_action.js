/*
TODO:
  * find an event I can use to shrink the browser_action
  * tooltip over the "Allow feedback" options
 */

// http://html5rocks.com/en/tutorials/file/dndfiles/
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
    alert.innerHTML = "Error. Cannot load file.";
    console.log(e);
  };

  if (file.type === 'application/json') {
    alert.innerHTML = "Files successfully loaded!";
    reader.readAsText(file);
  } else {
    alert.innerHTML = "Error. Tests must be in JSON file format.";
    alert.style.color = '#900';
  }
};

function sendDataToTab(data, type, callback) {
  // get the current tab then send data to it
  chrome.tabs.query({active: true, currentWindow: true}, fireOffData);
  
  // actually post data to a tab
  function fireOffData (arrayOfTabs) {
    var activeTab = arrayOfTabs[0];
    var activeTabId = activeTab.id;
    var message = {'data': data, 'type': type};
    chrome.tabs.sendMessage(activeTabId, message, function (response) {
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

function checkSiteStatus () {
  // talk to background script
  sendDataToTab(true, 'background-wake', function (response) {
    if (response) {
      allowFeedback.checked = true;
    }
  })
};

checkSiteStatus();