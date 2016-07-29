## Safari Interface
### Description
This directory contains files needed to build the extension for Safari. The goal is to make a WebExtension [adapter](https://en.wikipedia.org/wiki/Adapter_pattern) to reduce modification of the current code base.

### Architecture
#### Execution Context
##### Injected Scripts
The extension API of Safari differs substantially from the WebExtension API. The extension architecture is similar to other browsers in that it allows scripts (injected script) to be injected with a limited API access. In that matter, it could be compared to _content scripts_. There’s one script instance per tab (depending on injection condition). Only injected scripts can have access to the DOM while getting a different global execution context other than the `window` object.

##### Global Page
The extension allows to have an execution context with full access to the safari API (global page). However, this global execution context doesn’t have access to a webpage content (which is injected scripts’ role). The role of a _global page_ is to share its access of the API on demand. Injected scripts have to send a serialized message to the global page to trigger a custom action. Because it’s a message passing system, passed functions won’t be executed in their canonical way (not in their String representation).

#### User Interface Components
Safari has UI components that are similar to what WebExtension provides (e.g. _browser action_), but outside of the _browser action_ component, they differ significantly in their behaviour.
Popovers have the same behaviour as _browser action_ page would. The global page _global executing context_ can be accessed with the `safari.extension.globalPage.contentWindow` namespace. To avoid making two adapters, the _global page_ adapter will be used.

#### Safari Incompatibilities
##### Storage
Safari doesn’t support extension storage. Instead, we need to use the `safari.extension.settings` property to set an inner object representing the storage object to use.
##### Tabs and Windows
Safari doesn’t provide a method to uniquely identify a window or a tab. The adapter adds a module called `registry` that assign an ID to each window or tab. It also provides several functions to retrieve a list of tabs or windows.
### License
This directory and the whole project is subject to the [GPLv3 License](../license).
