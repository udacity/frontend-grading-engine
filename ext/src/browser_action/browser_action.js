// get the page being viewed. Get it's GE

// http://html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  // files is a FileList of File objects. List some properties.
  var output = [];
  // for (var i = 0, f; f = files[i]; i++) {
  //   output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a/', ') - ', f.size, ' bytes, last modified: ', f.lastModifiedDate ? f.lastModifiedDate.toLoacaleDateString() : 'n/a', '</li>');
  // }
  // document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
  
  var activeTabId = null;

  //stackoverflow
  chrome.tabs.query({
    active: true,
    currentWindow: true},
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      activeTabId = activeTab.id;
    }
  );

  chrome.tabs.sendMessage(activeTabId, {
    message: 'hello!'
  });

};

function loadFile(evt) {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    handleFileSelect(evt);
  } else {
    alert('The File APIs are not fully supported in this browser');
  }
};

document.getElementById('ud-file-loader').addEventListener('change', loadFile, false);