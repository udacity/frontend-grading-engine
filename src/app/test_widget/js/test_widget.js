/**
 * @fileoverview This file provides the test widget module. It injects an iFrame inside the current document to display a list of tests.
 */

/**
 * Module to handle the test widget.
 * @returns {Object} Methods to build the widget ({@link buildWidget}) and kill it ({@link killWidget}).
 * @throws {Error} Initialization errors.
 */
var testWidget = (function() {
  'use strict';
  var exports = {};
  var frameId = null;

  /**
   * Initializes the widget with its random ID (Not really useful) and append the widget to the current Document. The widget is an iFrame
   * @returns {Document} The iFrame document.
   */
  var _buildFrame = function () {
    frameId = 'tw-' + Math.floor(Math.random() * 100000000000).toString();

    // Since the iFrame loading is asynchronous
    var promise = new Promise(
      function(resolve, reject) {
        var tw = document.createElement('iframe');

        tw.id = frameId;
        tw.className = 'test-widget-display';
        tw.src = 'test_widget.html';

        document.body.appendChild(tw);

        tw.onload = function() {
          resolve(tw);
        };

        tw.onerror = function(e) {
          reject(e);
        };
      }).catch(function(e) {
        throw new Error('Couldn’t load the test widget.');
      });

    return promise;
  };


  /**
   * Calls {@link _buildFrame} and initialize {@link testResults}.
   */
  var buildWidget = function() {
    // Wait for the iFrame to load since it would return null
    _buildFrame().then(function() {
      return frameDocument();
    }).then(function(testWidgetDisplay) {
      console.log("testWidgetDisplay = ", testWidgetDisplay);
      var viewContainer = testWidgetDisplay.querySelector('.view-container');
      console.log("viewContainer = ", viewContainer);
      // initialize the view options
      var testResultsElem = components.createElement('test-results');
      viewContainer.appendChild(testResultsElem);
    });
  };

  /**
   * Removes the widget from the current Document.
   */
  var killWidget = function() {
    var tw = document.getElementById(frameId);

    document.body.removeChild(tw);
    frameId = null;
  };

  /**
   * Get the widget document. It prevents direct access to the iFrame.
   * @returns {Document}
   */
  var frameDocument = function() {
    return _frameContext().document;
  };

  /**
   * Returns the frame context.
   * @returns {Document} The current
   * @throws {Error} Errors about bad initialization.
   * @private
   */
  var _frameContext = function () {
    if(frameId === null) {
      throw new Error('The widget must first be created.');
    }
    var tw = document.getElementById(frameId);

    if(tw === null) {
      throw new Error('The “' + frameId + '” iframe doesn’t exist.');
    }

    // Compatibility fix
    return tw.contentWindow || tw.contentDocument.document || tw.contentDocument;
  };

  return {
    buildWidget: buildWidget,
    killWidget: killWidget,

    // TODO: Doesn’t seem to be used outside
    frameDocument: frameDocument
  };
})();

// test-widget.js ends here
