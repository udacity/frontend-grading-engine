/*
TODO:
  * find an event I can use to shrink the browser_action
  * tooltip over the "Allow feedback" options

 */

// http://html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(evt) {
  // shrink the browser action back to its original size
  document.querySelector('#main').style.width = '30em';

  var files = evt.target.files;  // FileList object
  var file = files[0];
  var reader = new FileReader();
  var alert = document.querySelector('.alert');
  alert.style.display = 'block';
  
  reader.onload = function (file) {
    sendDataToTab(file.target.result);
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

function sendDataToTab(file) {
  // actually post data to a tab
  var fireOffData = function (arrayOfTabs) {
    var activeTab = arrayOfTabs[0];
    var activeTabId = activeTab.id;
    chrome.tabs.sendMessage(activeTabId, file);
  }

  // get the current tab then send data to it
  chrome.tabs.query({active: true, currentWindow: true}, fireOffData);
};

document.querySelector('#ud-file-loader').addEventListener('change', handleFileSelect, false);
document.querySelector('#ud-file-loader').onclick = function () {
  // document.querySelector('#main').style.width = '800px';
};