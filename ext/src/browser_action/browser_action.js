// http://html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a/', ') - ', f.size, ' bytes, last modified: ', f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
  
  var file = files[0];

  var reader = new FileReader();

  reader.onerror = function (e) {
    document.querySelector('.is-testing').innerHTML = "Something went wrong: " + JSON.stringify(e);
  };

  reader.onload = function (file) {
    document.querySelector('.is-testing').innerHTML = "loaded?";
      sendDataToTab(file.target.result);
  };
  
  if (file.type === 'application/json') {
    reader.readAsText(file);
  }
};

function sendDataToTab(file) {
  // actually post data to a tab
  var fireOffData = function (arrayOfTabs) {
    var activeTab = arrayOfTabs[0];
    var activeTabId = activeTab.id;
    document.querySelector('.is-testing').innerHTML = activeTabId;
    chrome.tabs.sendMessage(activeTabId, file);
  }

  // get the current tab then send data to it
  chrome.tabs.query({active: true, currentWindow: true}, fireOffData);
};

document.getElementById('ud-file-loader').addEventListener('change', handleFileSelect, false);
document.getElementById('test').onclick = test;