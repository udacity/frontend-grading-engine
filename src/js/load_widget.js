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
    Some text explaining what this does.
 */

  (function() {    
    document.body.addEventListener('grader-passed', function (e) {console.log("All tests passed!")}, false)
    
    function supportsImports() {
      return 'import' in document.createElement('link');
    }
    if (supportsImports()) {
      // Cool!
    } else {
      // Use other libraries/require systems to load files.
      alert("You must use Google Chrome to get feedback and a code for this quiz. Sorry!");
    }

    // import templates
    var link = document.createElement('link');
    link.rel = 'import';
    
    // using try-catch to load from localhost if possible, fallback to github.io
    try {
      link.href = '/frontend-grading-engine/templates/test-widget.html'
    } catch (e) {
      link.href = 'http://udacity.github.io/frontend-grading-engine/templates/test-widget.html'
    }
    link.onload = function(e) {
      console.log('Loaded Udacity Grading Engine');
    }
    link.onerror = function(e) {
      console.log('Error loading import: ' + e.target.href);
    }
    document.head.appendChild(link);
  })()
    

