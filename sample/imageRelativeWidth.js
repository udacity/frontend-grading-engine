var suite1 = GE.registerSuite({
  name: "calc() Quiz",
  code: "myrelativesarewide"
});

suite1.registerTest({
  description: "There are three images",
  active_test: function (iwant) {
    return iwant.theseNodes('img').count.toEqual(3);
  }
})

suite1.registerTest({
  description: "There are 10px between #img1 and #img2",
  active_test: function (iwant) {
    var separation = iwant.theseNodes('#img2').absolutePosition('left').value - iwant.theseNodes('#img1').absolutePosition('right').value;
    return {
      isCorrect: separation === 10,
      actuals: separation
    };
  }
})

suite1.registerTest({
  description: "There are 10px between #img2 and #img3",
  active_test: function (iwant) {
    var separation = iwant.theseNodes('#img3').absolutePosition('left').value - iwant.theseNodes('#img2').absolutePosition('right').value;
    return {
      isCorrect: separation === 10,
      actuals: separation
    };
  }
})

suite1.registerTest({
  description: "Left image is flush against viewport",
  active_test: function (iwant) {
    return iwant.theseNodes('#img1').absolutePosition('left').toEqual(0);
  }
})

suite1.registerTest({
  description: "Right image is flush against viewport",
  active_test: function (iwant) {
    // console.log(iwant.theseNodes('#img3').absolutePosition('right').toEqual('max'))
    return iwant.theseNodes('#img3').absolutePosition('right').toEqual('max');
  }
});