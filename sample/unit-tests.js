/**
 * @fileOverview This file contains unit tests to be loaded.
 * @name unit-tests.js<sample>
 * @author Cameron Pittman
 * @license GPLv3
 */

console.log('dispatch event');
window.dispatchEvent(new CustomEvent('ud-test', {'detail': 'passed'}));

// unit-test.js<sample> ends here
