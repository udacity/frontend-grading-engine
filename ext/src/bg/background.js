// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     console.log(request);
//     sendResponse({test: 'test response'});
//   });

// use GE.activeTestRegistry.someMethod to add new suites.
// TODO: validate JSON to go into activeTestRegistry

function isInCorrectFormat (JSON) {
  // is it an array of suite objects, each containing arrays of tests, each containing active_tests and descriptions?
}

function injectSuites (suites) {
  GE.registerSuites(suites);
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    sendResponse({farewell: "goodbye"});
  });