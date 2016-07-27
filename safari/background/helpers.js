/*global safari */

/**
 * @fileOverview This file adds utility functions for the Safari global page.
 * @name helpers.js<background>
 * @author Etienne Prud’homme
 * @license GPL
 */

/**
 * Store logging informations in the extension settings.
 * @param {string|error} message - The message to log as a String or an Error.
 * @throws {Error} Error in the arguments of the function (not a String nor an
 * Error).
 */
function extensionLog(log) {
  // Cache logs to append a single log
  var logs = safari.extension.settings.logs;
  var stack, logMessage;

  if(log instanceof Error) {
    logMessage = log.message;
    stack = log.stack;
  } else if (logMessage instanceof String || typeof logMessage === 'string') {
    logMessage = log;
    stack = new Error().stack;
  } else {
    // Log error of itself
    extensionLog('Invalid log type: ' + log.toString());
    throw new Error('Extension logging error');
  }

  // Adding the new log
  logs.push({
    message: logMessage,
    stack: stack,
    timestamp: Date.now() / 1000
  });

  // Record the new logs
  safari.extension.settings.logs = logs;
  // This should be in the Background script and shouldn’t conflict with page
  // scripts
  console.warn(log);

  // Actually throw that error
  if(log instanceof Error) {
    throw log;
  }
}

// helpers.js<background> ends here
