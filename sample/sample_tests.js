var suite1 = GE.registerSuite({
  name: "div checker",
  code: "I'm a cool code!"
});

suite1.registerTest({
  description: "There are 9 divs on the page",
  active_test: function(iwant) {
    return iwant.theseNodes('div').length().toBeGreaterThan(9);
  },
  flags: [
    {
      async: false
    }
  ]
})

suite1.registerTest({
  description: "There is 1 h1 on the page",
  active_test: function(iwant) {
    return iwant.theseNodes('h1').length().toBeLessThan(2);
  }
})

suite1.registerTest({
  description: "Each div is pink",
  active_test: function(iwant) {
    return iwant.theseNodes('div').cssProperty('backgroundColor').toEqual('rgb(255, 204, 204)');
  }
})


function m() {};
m.baz = "bazzzz"
m.func = function(thing) {
  if (this.baz === "bazzzz") {
    console.log("it's old " + thing)
  } else if (this.baz === "changed") {
    console.log("it's new " + thing)
  }
}

Object.defineProperties(m, {
  bar: {
    get: function() {
      this.baz = "changed"
      return this;
    }
  }
})

var n = Object.create(m);