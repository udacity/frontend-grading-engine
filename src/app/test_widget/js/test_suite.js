/**
 * @fileOverview This file registers the `test-suite` component. {@link test-results} and {@link test-widget} should have executed already.
 * @name test_suite.js
 * @author Etienne Prud’homme
 * @license MIT
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
        '  <div class="suite-code"></div>' +
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
    var sc = self.querySelector('.suite-code');

    var titleEnd = " Test";
    if (numberOfTests > 1) {
      titleEnd = " Tests";
    }

    self.querySelector('.suite-title').innerHTML = suiteName + titleEnd;

    // Redefinition at each update?
    /**
     * Displays the secret code.
     * @param {boolean} show - Whether the code should be shown.
     */
    function displayCode (show) {
      if (show) {
        sc.innerHTML = "<div>" + suiteName + " Code:<br>" + suiteCode + "</div>";
      } else {
        sc.innerHTML = "";
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
