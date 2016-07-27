/*global components */

/**
 * @fileoverview This file registers the `test-suite` component. `test-results` and `test-widget` should have executed already.
 */


/**
 * Registers the `test-suite` component.
 */
(function() {
  'use strict';
  var self = null;
  var proto = {};

  var template = '<!-- test-suite component ends here -->' +
        '<div class="suite">' +
        '  <div class="suite-title"></div>' +
        '  <div class="active-tests"></div>' +
        '  <div class="suite-code-container"><span class="suite-name"></span> Code:<br><span class="suite-code"></span></div>' +
        '</div>' +
        '<!-- test-suite component ends here -->';

  /**
   * Called when the component is attached to the DOM.
   */
  proto.attachedCallback = function() {
    var suite = this.suite;     // Is it ever used?
    self = this;
    updateView();
  };


  /**
   * Called when the main container changed its attributes.
   */
  proto.attributeChangedCallback = function() {
    self = this;
    updateView();
  };

  function updateView() {
    var suiteName = self.dataset.name;
    var suitePassed = self.dataset.suitePassed;
    var suiteCode = self.code;
    var numberOfTests = self.dataset.numberOfTests;

    var suite = self;
    var codeContainer = {
      container: self.getElementsByClassName('suite-code-container')[0],
      suiteName: self.getElementsByClassName('suite-name')[0],
      suiteCode: self.getElementsByClassName('suite-code')[0]
    };

    var titleEnd = numberOfTests > 1 ? " Tests" : " Test";

    self.querySelector('.suite-title').textContent = suiteName + titleEnd;

    // Redefinition at each update?
    /**
     * Displays the secret code.
     * @param {boolean} show - Whether the code should be shown.
     */
    function displayCode (show) {
      if (show) {
        codeContainer.container.style.display = 'block';
        codeContainer.suiteName.textContent = suiteName;
        codeContainer.suiteCode.textContent = suiteCode;
      } else {
        codeContainer.container.style.display = 'none';
        codeContainer.suiteName.textContent = '';
        codeContainer.suiteCode.textContent = '';
      }
    };

    if (suitePassed === 'true') {
      displayCode(true);
    } else {
      displayCode(false);
    }
  };

  components.registerElement('test-suite', template, proto);
})();

// test_suite.js ends here
