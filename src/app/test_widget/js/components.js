/**
 * @fileoverview This file contains a custom function for emulating Web Components callbacks.
 */

/**
 * Module to construct custom components (i.e. Element tree). It tries to emulate the behavior of Web Components while being native HTML.
 * @returns {Object} Methods to register a component ({@link registerElement}) and to create an instance of that component ({@link createElement}).
 * @throws {Error} Errors about component initialization.
 */
var components = (function() {

  var customElements = {};

  // Compatibility fix. See: http://stackoverflow.com/a/34292615
  var range = document.createRange();
  range.selectNode(document.body);

  /**
   * Register a custom element.
   * @param {String} _name - The name to identify the custom element.
   * @param {string} _template -
   * @param {Object} _proto - Callbacks for WebComponents. See: http://thejackalofjavascript.com/web-components-future-web/#custELeLifeCyncle
   * @throws {Error} Various errors about a component initialization.
   */
  var registerElement = function(_name, _template, _proto) {
    if(_name.constructor !== String || _name === '') {
      throw new Error('Cannot register the component. The name must be a String.');
    }
    if(_template.constructor !== String || _template === '') {
      throw new Error('Cannot register ' + _name +' component. The template must be a String.');
    }
    if(customElements[_name] !== undefined && customElements.hasOwnProperty(_name)) {
      throw new Error(_name + ' is an already registered component.');
    }

    var proto = _proto || {};

    Object.defineProperty(customElements, _name, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: {
        template: _template,
        proto: proto
      }
    });

  };

  /**
   * Create an instance of a specified element by returning a {@linkcode DocumentFragment}. The responsability to inject the fragment is left to the user. This element must be present in {@link customElements}.
   * @param {string} _name - The unique name of the element.
   * @returns {DocumentFragment} - A document fragment containing the element template and its attached callbacks.
   * @throws {Error} Component instantiation error.
   */
  var createElement = function(_name) {
    if(!customElements.hasOwnProperty(_name)) {
      throw new Error('“' + _name + '” is not a registered component');
    }

    var customElement = customElements[_name];

    // For compatibility reasons, it is the best way to write a String to an Element.
    var fragment = range.createContextualFragment(customElement.template);

    var topNode = null;

    // Take the first Node (not a comment)
    for(var i=0, len=fragment.childNodes.length; i<len; i++) {
      if(fragment.childNodes[i].nodeType !== 8) {
        topNode = fragment.childNodes[i];
        break;
      }
    }
    // Verifies that there’s at least one node
    if(topNode === null) {
      throw new Error('The “' + _name + '” component doesn’t contain a valid node.');
    }

    // Note: using proto.createdCallback is useless here (as far as I know) since it’s handled by the user.

    // proto.attachedCallback
    // This callback is called when the element is attached to the DOM (i.e. appendChild). It does so because when a DocumentFragment is attached to the DOM, its content is emptied (thus removing its childNodes).
    var attachedCb = customElement.proto.attachedCallback;
    if(attachedCb instanceof Function) {
      var observerAttached = new MutationObserver(function(mutations) {
        for(var i=0, len=mutations.length; i<len; i++) {
          // When a DocumentFragment is appended, it becomes void
          if(mutations[i].type === 'childList' && fragment.childNodes.length === 0) {
            attachedCb.call(topNode);
          }
        }
      });
      observerAttached.observe(fragment, {childList: true});
    }

    // proto.attributeChangedCallback
    // This callback is called when an attribute of the container (top most) element changed. It doesn’t include children elements.
    var attributeChangedCb = customElement.proto.attributeChangedCallback;
    if(attributeChangedCb instanceof Function) {
      var observerAttr = new MutationObserver(function(mutations) {
        for(var i = 0, len=mutations.length; i<len; i++) {
          if(mutations[i].type === 'attributes') {
            attributeChangedCb.call(topNode);
          }
        }
      });

      // Only observe attribute mutations
      observerAttr.observe(topNode, {attributes: true});
    }

    // proto.detachedCallback isn’t implemented

    return fragment;
  };

  return {
    registerElement: registerElement,
    createElement: createElement
  };
})();

// components.js ends here
