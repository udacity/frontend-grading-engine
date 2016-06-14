/**
 * @fileoverview This file registers the `active-test` component. This file doesn’t depend on other components.
 */

(function() {
  'use strict';
  var self = null;

  var proto = {};

  var template = '<div class="active-test">' +
        '  <div class="flex-container">' +
        '    <div class="mark incorrect"><span class="test-desc"></span></div>' +
        '  </div>' +
        '</div>' +
        '<!-- active-test ends here -->';

  /*
   Called when the element gets attached to the document
   */
  proto.attachedCallback = function() {
    self = this;
    self.dataset.testPassed = false;
    updateView();
  };

  /*
   Called when any attribute on the element changes
   */
  proto.attributeChangedCallback = function () {
    self = this;
    updateView();
  };

  /**
   * Main function for updating member elements.
   */
  function updateView() {
    try {
      var testDescription = self.dataset.description;
      var testPassed = self.dataset.testPassed;
    } catch (e) {
      console.log(e);
    }

    var markRightOrWrong = self.querySelector('.mark');
    var descriptionDisplay = self.querySelector('.test-desc');
    descriptionDisplay.innerHTML = testDescription;

    function testHasPassed() {
      markRightOrWrong.classList.remove('incorrect');
      markRightOrWrong.classList.remove('error');
      markRightOrWrong.classList.add('correct');
    };

    function testHasFailed() {
      markRightOrWrong.classList.add('incorrect');
      markRightOrWrong.classList.remove('correct');
      markRightOrWrong.classList.remove('error');
    };

    function testHasErred() {
      markRightOrWrong.classList.remove('correct');
      markRightOrWrong.classList.remove('incorrect');
      markRightOrWrong.classList.add('error');
    };

    if (testPassed === 'true') {
      testHasPassed();
    } else if (testPassed === 'false') {
      testHasFailed();
    } else if (testPassed === 'error') {
      testHasErred();
    }
  };

  components.registerElement('active-test', template, {prototype: proto});
})();
