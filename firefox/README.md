## Firefox interface
### Description
This directory contains files needed to build the extension for Firefox based browsers (may include IceWeasel or IceCat).

While the WebExtensions API is well supported in Chromium, Firefox needs to have specific quirks.

### Incompatibilities
Because Firefox doesn’t yet support some features and that backward compatibility was preferred, here are some issues:

* Firefox doesn’t support the `sync` `StorageArea` (i.e. `chrome.storage.sync.*`). A wrapper was made to instead `local` `StorageArea`.
  - Before version 48, Firefox didn’t support the `chrome.storage` API in _content scripts_. The above wrapper is replaced with a message channel between the _event page_ (background page) and the _content script_.
* Before version 48, Firefox didn’t support the _options page_ (or `options\_ui`). An icon is added in the _action page_ to access a page to modify the settings. That’s currently the only way to access the options prior to version 48.

* Firefox and Chromium don’t seem to handle promises the same way. For example, Firefox couldn’t load the JSON tests before the execution of unit tests.

### Prerequisites
Firefox 45 or higher is needed to support WebExtensions.

### Building
* TODO

## License
This directory and the whole project is subject to the [GPLv3 License](../license).
