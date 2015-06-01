
/***
 *      _______                   _   
 *     |__   __|                 | |  
 *        | | __ _ _ __ __ _  ___| |_ 
 *        | |/ _` | '__/ _` |/ _ \ __|
 *        | | (_| | | | (_| |  __/ |_ 
 *        |_|\__,_|_|  \__, |\___|\__|
 *                      __/ |         
 *                     |___/          
 
An instance of a Target represents a piece of information about the page.

Targets are:
  * nested into a tree-like structure called a bullseye
  * usually mapped 1:1 with DOM elements

The top-level target living directly on the TA will not map to any element. But it contains children which do map 1:1 with elements.
*/

function Target() {
  this.id = parseInt(Math.random() * 1000000);  // a unique number used only for internal tracking purposes
  this.element = null;
  this.value = null;
  this.operation = null;
  this.children = [];
  this.index = null;
};

Object.defineProperties(Target.prototype, {
  hasChildren: {
    get: function() {
      var hasKids = false;
      if (this.children.length > 0) {
        hasKids = true;
      };
      return hasKids;
    }
  },
  hasValue: {
    get: function() {
      var somethingThere = false;
      if (this.value !== null && this.value !== undefined) {
        somethingThere = true;
      };
      return somethingThere;
    }
  },
  hasGrandkids: {
    get: function() {
      var gotGrandKids = false;
      gotGrandKids = this.children.some(function (kid) {
        return kid.hasChildren;
      });
      return gotGrandKids;
    }
  }
});