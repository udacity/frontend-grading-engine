(function() {
  'use strict';
  var self = null;
  var proto = {};
  var root = testWidget.frameDocument();

  var template = '<!-- test-suite component ends here -->' +
        '<div class="suite">' +
        '  <div class="suite-title"></div>' +
        '  <div class="active-tests"></div>' +
        '  <div class="suite-code"></div>' +
        '</div>' +
        '<!-- test-suite component ends here -->';

  proto.attachedCallback = function() {
    var suite = this.suite;
    self = this;
    updateView();
  };

  proto.attributeChangedCallback = function() {
    self = this;
    updateView();
  };

  function updateView() {
    var suiteName = self.dataset.name;
    var suitePassed = self.dataset.suitePassed;
    var suiteCode = self.code;
    var numberOfTests = self.dataset.numberOfTests;

    var suite = self.querySelector('.suite');
    var sc = self.querySelector('.suite-code');

    var titleEnd = " Test";
    if (numberOfTests > 1) {
      titleEnd = " Tests";
    }

    self.querySelector('.suite-title').innerHTML = suiteName + titleEnd;

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
