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
  reader.onload = (function (file) {
    return function (e) {
      document.getElementById('the-file').innerHTML = e.target.result;
    }
  })(file);

  reader.readAsText(file);
};

function test() {
  chrome.tabs.query({
    active: true,
    currentWindow: true},
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      var activeTabId = activeTab.id;
      document.querySelector('.is-testing').innerHTML = activeTabId;
      
      chrome.tabs.sendMessage(activeTabId, {
        message: "this is just a test from " + activeTabId
      });
    }
  );
};

document.getElementById('ud-file-loader').addEventListener('change', handleFileSelect, false);
document.getElementById('test').onclick = test;