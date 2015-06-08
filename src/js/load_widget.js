
/***
 *     _                     _   _    _ _     _            _   
 *    | |                   | | | |  | (_)   | |          | |  
 *    | |     ___   __ _  __| | | |  | |_  __| | __ _  ___| |_ 
 *    | |    / _ \ / _` |/ _` | | |/\| | |/ _` |/ _` |/ _ \ __|
 *    | |___| (_) | (_| | (_| | \  /\  / | (_| | (_| |  __/ |_ 
 *    \_____/\___/ \__,_|\__,_|  \/  \/|_|\__,_|\__, |\___|\__|
 *                                               __/ |         
 *                                              |___/          
 */
 /*
    Load the HTML template describing the widget.
 */

  (function() {    
    function supportsImports() {
      return 'import' in document.createElement('link');
    }
    if (supportsImports()) {
      // Cool!
    } else {
      // Use other libraries/require systems to load files.
      alert("You must use the latest version of Google Chrome to get feedback and a code for this quiz. Sorry!");
    }

    // import templates
    var link = document.createElement('link');
    link.rel = 'import';
    link.href = '/frontend-grading-engine/dist/test-widget.html';
    document.head.appendChild(link);
    
    link.onload = function(e) {
      console.log('Loaded Udacity feedback widget');
      initRegistrar();
    }
    link.onerror = function(e) {
      throw new Error('Failed to load the Udacity Grading Engine. Please reload.');
    }
  })()