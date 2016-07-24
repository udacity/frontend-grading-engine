chrome.runtime.openOptionsPage = function() {
  chrome.tabs.create({url: chrome.extension.getURL('app/options/index.html')});
};
