## Safari Global Page

The files in this directory get concatenated into `global.js`. It is somehow
similar to what the WebExtensions background page does.

Because the Safari uses its own extension API, most of the work to port this
extension to Safari is in providing a WebExtensions adapter.
