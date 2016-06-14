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
    console.log(self);
    var testSuites = self.querySelector('.test-suites');

    var hideShowButton = self.querySelector('button.toggle-display');
    var placeholder = self.querySelector('em.placeholder');

    // Unused
    var maxHeight = null;
    var buildSuiteElement = function (newSuite) {
      // toggle button and placeholder views
      if (hideShowButton.disabled === true) {
        hideShowButton.removeAttribute('disabled');
      }
      placeholder.innerHTML = '';

      // actually create the suite
      var _testSuite = components.createElement('test-suite');

      _testSuite.dataset.name = newSuite.name;
      _testSuite.dataset.suitePassed = false;
      _testSuite.code = newSuite.code;  // to avoid leaving the code as an easy-to-spot attribute
      _testSuite.suite = newSuite;

      testSuites.appendChild(_testSuite);

      return _testSuite;
    };
    exports.buildSuiteElement = buildSuiteElement;

    // Toggle visibility of tests
    hideShowButton.onclick = function () {
      testSuites.classList.toggle('hide');

      this.classList.toggle('shown');
      this.classList.toggle('hidden');

      placeholder.classList.toggle('hide');

      if (this.classList.contains('hidden')) {
        placeholder.innerHTML = "Tests hidden";
      } else {
        placeholder.innerHTML = "";
      }
    };
  };

  components.registerElement('test-results', template, proto);

  // exports.buildSuiteElement(newSuite)
  return exports;
})();
