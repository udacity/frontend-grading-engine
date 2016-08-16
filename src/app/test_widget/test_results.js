/*global components */

/**
 * @fileOverview This file registers the `test-results` component. This component is the main container and contains procedures for creating new `suites`. {@link test-results.js}, {@link test-widget.js}, {@link test-suite.js} should have executed already.
 * @name test_results.js<test_widget>
 * @author Etienne Prud’homme
 * @license MIT
 */

/**
 * Main test container module.
 * @returns {Object} Method to build a new `suite` of tests.
 */
var testResults = (function() {
  'use strict';
  var exports = {};
  var proto = {};

  var template = '<!-- test-results component starts here -->' +
        '<div class="test-results">' +
        '  <div class="upper-display">' +
        '    <em class="placeholder">No tests loaded</em>' +
        '    <button class="toggle-display shown" disabled> Test Results</button>' +
        '  </div>' +
        '  <div class="test-suites"></div>' +
        '</div>' +
        '<!-- test-results component ends here -->';

  var buildSuiteElement = function() {};

  proto.attachedCallback = function() {
    var self = this;
    // console.log(self);
    var testSuites = self.querySelector('.test-suites');

    var hideShowButton = self.querySelector('button.toggle-display');
    var placeholder = self.querySelector('em.placeholder');

    /**
     * Builds a new suite of tests.
     * @param {suite} newSuite - The suite to build
     * @returns {HTMLElement} The newly created suite.
     */
    buildSuiteElement = function (newSuite) {
      // toggle button and placeholder views
      if (hideShowButton.disabled === true) {
        hideShowButton.removeAttribute('disabled');
      }
      placeholder.textContent = '';

      // actually create the suite
      var _testSuiteFragment = components.createElement('test-suite');
      var _testSuite = '';

      // Take the first Node (not a comment)
      for(var i=0, len=_testSuiteFragment.childNodes.length; i<len; i++) {
        if(_testSuiteFragment.childNodes[i].nodeType !== 8) {
          _testSuite = _testSuiteFragment.childNodes[i];
          break;
        }
      }

      _testSuite.dataset.name = newSuite.name;
      _testSuite.dataset.suitePassed = false;
      _testSuite.code = newSuite.code;  // to avoid leaving the code as an easy-to-spot attribute
      _testSuite.suite = newSuite;

      testSuites.appendChild(_testSuiteFragment);

      return _testSuite;
    };
    exports.buildSuiteElement = buildSuiteElement;

    /**
     * Toggle visibility of tests
     */
    hideShowButton.onclick = function () {
      testSuites.classList.toggle('hide');

      this.classList.toggle('shown');
      this.classList.toggle('hidden');

      placeholder.classList.toggle('hide');

      if (this.classList.contains('hidden')) {
        placeholder.textContent = 'Tests hidden';
      } else {
        placeholder.textContent = '';
      }
    };
  };

  components.registerElement('test-results', template, proto);

  // exports.buildSuiteElement(newSuite)
  return exports;
})();

// test-results.js<test_widget> ends here
