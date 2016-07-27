/**
 * @fileOverview Targets are:
 *  • nested into a tree-like structure called a bullseye
 *  • usually mapped 1:1 with DOM elements
 *
 *  The top-level target living directly on the TA will not map to any element. But it contains children which do map 1:1 with elements.
 * @name Target.js<GE>
 * @author Cameron Pittman
 * @license GPLv3
 */

/**
 * Target constructor sets the target defaults. It includes a unique id number for private tracking.
 */
function Target() {
  this.id = parseInt(Math.random() * 1000000);
  this.element = null;
  this.value = null;
  this.operation = null;
  this.children = [];
  this.index = null;
  this.correct = false;
};

Object.defineProperties(Target.prototype, {
  hasChildren: {
    /**
     * Public method for determining if a Target has child Targets.
     * @return {Boolean} hasKids - true if there are chldren, false otherwise.
     */
    get: function() {
      var hasKids = false;
      if (this.children.length > 0) {
        hasKids = true;
      };
      return hasKids;
    }
  },
  hasValue: {
    /**
     * Public method for determining if a value exists on a Target.
     * @return {Boolean} somethingThere - true if a value exists, false otherwise.
     */
    get: function() {
      var somethingThere = false;
      if (this.value !== null && this.value !== undefined) {
        somethingThere = true;
      };
      return somethingThere;
    }
  },
  hasGrandkids: {
    /**
     * Public method for determining if a Target’s children have children.
     * @return {Boolean} hasGrandKids - true if there are grandchildren, false otherwise.
     */
    get: function() {
      var gotGrandKids = false;
      gotGrandKids = this.children.some(function (kid) {
        return kid.hasChildren;
      });
      return gotGrandKids;
    }
  }
});

// Target.js<js> ends here
