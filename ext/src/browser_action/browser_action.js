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
      if (file.type === 'application/json') {
        
        var invalidStrings = [
          {
            regex: 'document',
            errorMessage: "No references to document are allowed in activeTests."
          },
          {
            regex: 'window',
            errorMessage: "No references to window are allowed in activeTests."
          },
          {
            regex: 'event',
            errorMessage: "No references to event are allowed in activeTests."
          },
          {
            regex: '&&',
            errorMessage: "No boolean operators are allowed in activeTests."
          },
          {
            regex: '\|\|',
            errorMessage: "No boolean operators are allowed in activeTests."
          },
          {
            regex: 'appendChild',
            errorMessage: "No DOM manipulation methods are allowed in activeTests."
          },
          {
            regex: 'insertBefore',
            errorMessage: "No DOM manipulation methods are allowed in activeTests."
          },
          {
            regex: 'createElement',
            errorMessage: "No DOM manipulation methods are allowed in activeTests."
          },
          {
            regex: 'function\s?\(.*\)\s?\{.*\}',
            errorMessage: "No function definitions are allowed in activeTests."
          },
          {
            regex: 'function\s*\w*\s?\(.*\)\s?\{.*\}'
            errorMessage: "No function definitions are allowed in activeTests."
          },
          {
            regex: 'localStorage'
            errorMessage: "No references to localStorage are allowed in activeTests."
          },
          {
            regex: 'sessionStorage'
            errorMessage: "No references to sessionStorage are allowed in activeTests."
          },
          {
            regex: 'indexedDB'
            errorMessage: "No references to indexedDB are allowed in activeTests."
          },
          {
            regex: 'Worker'
            errorMessage: "No references to Worker are allowed in activeTests."
          },
          {
            // regex: 'new\s*\w*\s*(\(.*\))?', // necessary or overkill to check () at end?
            regex: 'new',
            errorMessage: "No references to Worker are allowed in activeTests."
          }
        ]

        var requiredStrings = [
          {
            regex: '^iwant\.',
            errorMessage: "Each activeTest much start with iwant."
          }
        ]

        // prompt users with exactly what tests will be added
        // create a sandboxed iframe in testwidget
        // run code in sandbox, send message to DOM to ask for info

        sendFileToTab(e.target.result);
      }
    }
  })(file);

  reader.readAsText(file);
};

function sendFileToTab(file) {
  chrome.tabs.query({
    active: true,
    currentWindow: true},
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      var activeTabId = activeTab.id;
      document.querySelector('.is-testing').innerHTML = activeTabId;
      chrome.tabs.sendMessage(activeTabId, file);
    }
  );
};

document.getElementById('ud-file-loader').addEventListener('change', handleFileSelect, false);
document.getElementById('test').onclick = test;