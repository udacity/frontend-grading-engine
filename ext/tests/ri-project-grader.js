var part1 = GE.registerSuite({
  name: "Project Part 1",
  code: "ready!set!responsiveimages!"
})

part1.registerTest({
  description: "&lt;img&gt;s have max-widths of 100%",
  active_test: function (iWant) {
    return iWant.someOf.theseNodes('article img').cssProperty('max-width').toEqual('100%');
  }
})

part1.registerTest({
  description: "&lt;article&gt;s are reasonably wide (600-1200px)",
  active_test: function (iWant) {
    return iWant.theseNodes('article').cssProperty('width').toBeInRange(600, 1200);
  }
})

var part2 = GE.registerSuite({
  name: "Project Part 2",
  code: "markupisprettyawesome"
});

part2.registerTest({
  description: "smiley_face.png is gone",
  active_test: function (iWant) {
    return iWant.theseNodes('img[src="images_src/fixed/smiley_face.png"]').not.toExist;
  }
})

part2.registerTest({
  description: "&lt;meta&gt; has charset set to utf-8",
  active_test: function (iWant) {
    return iWant.onlyOneOf.theseNodes('meta').attribute('charset').toEqual('utf-8');
  }
})

part2.registerTest({
  description: "Smiley face is unicode",
  active_test: function (iWant) {
    return iWant.someOf.theseNodes('p').innerHTML.toHaveSubstring([
      "☺", "&#9786;",
      "☹", "&#2639;",
      "☻", "&#9787;",
      "😀", "&#128512;",
      "😁", "&#128513;",
      "😂", "&#128514;",
      "😃", "&#128515;",
      "😄", "&#128516;",
      "😅", "&#128517;",
      "😆", "&#128518;",
      "😇", "&#128519;",
      "😈", "&#128520;",
      "😉", "&#128521;",
      "😊", "&#128522;",
      "😋", "&#128523;",
      "😌", "&#128524;",
      "😍", "&#128525;",
      "😎", "&#128526;",
      "😏", "&#128527;",
      "😐", "&#128528;",
      "😑", "&#128529;",
      "😒", "&#128530;",
      "😓", "&#128531;",
      "😔", "&#128532;",
      "😕", "&#128533;",
      "😖", "&#128534;",
      "😗", "&#128535;",
      "😘", "&#128536;",
      "😙", "&#128537;",
      "😚", "&#128538;",
      "😛", "&#128539;",
      "😜", "&#128540;",
      "😝", "&#128541;",
      "😞", "&#128542;",
      "😟", "&#128543;",
      "😠", "&#128544;",
      "😡", "&#128545;",
      "😢", "&#128546;",
      "😣", "&#128547;",
      "😤", "&#128548;",
      "😥", "&#128549;",
      "😦", "&#128550;",
      "😧", "&#128551;",
      "😨", "&#128552;",
      "😩", "&#128553;",
      "😪", "&#128554;",
      "😫", "&#128555;",
      "😬", "&#128556;",
      "😭", "&#128557;",
      "😮", "&#128558;",
      "😯", "&#128559;",
      "😰", "&#128560;",
      "😱", "&#128561;",
      "😲", "&#128562;",
      "😳", "&#128563;",
      "😴", "&#128564;",
      "😵", "&#128565;",
      "😶", "&#128566;",
      "😷", "&#128567;",
      "😸", "&#128568;",
      "😹", "&#128569;",
      "😺", "&#128570;",
      "😻", "&#128571;",
      "😼", "&#128572;",
      "😽", "&#128573;",
      "😾", "&#128574;",
      "😿", "&#128575;",
      "🙀", "&#128576;"
    ]);
  }
})

part2.registerTest({
  description: "Flourish is gone",
  active_test: function (iWant) {
    return iWant.theseNodes('img[src="images_src/fixed/flourish.png"]').not.toExist;
  }
});

part2.registerTest({
  description: "A Twitter font icon is on the page",
  active_test: function (iWant) {
    return iWant.onlyOneOf.theseNodes('a').attribute('class').toHaveSubstring('twitter');
  }
});

part2.registerTest({
  description: "A Digg font icon is on the page",
  active_test: function (iWant) {
    return iWant.onlyOneOf.theseNodes('a').attribute('class').toHaveSubstring('digg');
  }
});

part2.registerTest({
  description: "A Facebook font icon is on the page",
  active_test: function (iWant) {
    return iWant.onlyOneOf.theseNodes('a').attribute('class').toHaveSubstring('facebook');
  }
});

part2.registerTest({
  description: "A Google+ font icon is on the page",
  active_test: function (iWant) {
    return iWant.onlyOneOf.theseNodes('a').attribute('class').toHaveSubstring('google');
  }
});

var part3 = GE.registerSuite({
  name: "Project Part 3",
  code: "allthepictures,allthetime"
})

part3.registerTest({
  description: "There are 8 &lt;picture&gt;s on the page",
  active_test: function (iWant) {
    return iWant.theseNodes('picture').count.toEqual(8);
  }
})

part3.registerTest({
  description: "There are 2 &lt;sources&gt;s per &lt;picture&gt;",
  active_test: function (iWant) {    
    return iWant.theseElements('picture').deepChildren('source').count.toEqual(2);
  }
})

part3.registerTest({
  description: "There is 1 &lt;img&gt; per &lt;picture&gt;",
  active_test: function (iWant) {
    return iWant.theseNodes('picture').deepChildren('img').count.toEqual(1);
  }
})

part3.registerTest({
  description: "&lt;img&gt; is last child of all &lt;picture&gt;s",
  active_test: function (iWant) {
    return iWant.theseNodes('picture').shallowChildren('img').childPosition.toEqual(2);
  }
})

part3.registerTest({
  description: "Every &lt;img&gt; has an alt attribute",
  active_test: function (iWant) {
    return iWant.theseNodes('img').attribute('alt').toExist;
  }
})