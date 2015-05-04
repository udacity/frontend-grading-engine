var suite1 = GE.registerSuite({
  name: "div checker",
  code: "I'm a cool code!"
});

suite1.registerTest({
  description: "There are less than 10 divs on the page",
  active_test: function(iwant) {
    return iwant.theseNodes('div').count.toBeLessThan(10);
  },
  flags: [
    {
      async: false
    }
  ]
})

suite1.registerTest({
  description: "There are less than 1 h1s on the page",
  active_test: function(iwant) {
    return iwant.theseNodes('h1').count.toBeLessThan(1);
  }
})

suite1.registerTest({
  description: "Each div is pink",
  active_test: function(iwant) {
    return iwant.theseNodes('div').cssProperty('backgroundColor').toEqual('rgb(255, 204, 204)');
  }
})

suite1.registerTest({
  description: "There's a p tag",
  active_test: function(iwant) {
    return iwant.theseNodes('p').toExist;
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

m.log = function(msg) {
  console.log(msg);
};

Object.defineProperties(m, {
  bar: {
    get: function() {
      this.baz = "changed";
      this.log('worked!');
      return this;
    }
  }
})

var n = Object.create(m);