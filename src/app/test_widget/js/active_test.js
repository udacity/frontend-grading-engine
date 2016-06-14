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
   * Function to mark a test as `Passed`.
   * @param {HTMLElement} markRightOrWrong - The element containing the mark.
   * @private
   */
  function _testHasPassed(markRightOrWrong) {
    markRightOrWrong.classList.remove('incorrect');
    markRightOrWrong.classList.remove('error');
    markRightOrWrong.classList.add('correct');
  };

  /**
   * Function to mark a test as `Failed`.
   * @param {HTMLElement} markRightOrWrong - The element containing the mark.
   * @private
   */
  function _testHasFailed(markRightOrWrong) {
    markRightOrWrong.classList.add('incorrect');
    markRightOrWrong.classList.remove('correct');
    markRightOrWrong.classList.remove('error');
  };

  /**
   * Function to mark a test as `Erred` (is not valid).
   * @param {HTMLElement} markRightOrWrong - The element containing the mark.
   * @private
   */
  function _testHasErred(markRightOrWrong) {
    markRightOrWrong.classList.remove('correct');
    markRightOrWrong.classList.remove('incorrect');
    markRightOrWrong.classList.add('error');
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

    if (testPassed === 'true') {
      _testHasPassed(markRightOrWrong);
    } else if (testPassed === 'false') {
      _testHasFailed(markRightOrWrong);
    } else if (testPassed === 'error') {
      _testHasErred(markRightOrWrong);
    }
  };

  components.registerElement('active-test', template, {prototype: proto});
})();
