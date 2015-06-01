
/***
 *       _____               _      ____              _    
 *      / ____|             | |    |  _ \            | |   
 *     | |  __ _ __ __ _  __| | ___| |_) | ___   ___ | | __
 *     | | |_ | '__/ _` |/ _` |/ _ \  _ < / _ \ / _ \| |/ /
 *     | |__| | | | (_| | (_| |  __/ |_) | (_) | (_) |   < 
 *      \_____|_|  \__,_|\__,_|\___|____/ \___/ \___/|_|\_\
 *                                                         
 *                                                         

The GradeBook maintains and reports on the state of a set of questions registered by the TA. The GradeBook reports out on the final state of each active_test.
*/

function GradeBook() {
  this.questions = [];
  this.passed = false;
};

Object.defineProperties(GradeBook.prototype, {
  numberOfQuestions: {
    get: function () {
      return this.questions.length;
    }
  },
  numberCorrectQuestions: {
    get: function () {
      var numberCorrect = 0;
      this.questions.forEach(function (question) {
        if (question.correct) {
          numberCorrect +=1;
        }
      })
      return numberCorrect;
    }
  },
  allCorrect: {
    get: function () {
      var isAllGood = false;
      if (this.numberOfQuestions === this.numberCorrectQuestions && this.numberOfQuestions > 0) {
        isAllGood = true;
      }
      return isAllGood;
    }
  },
  numberWrongQuestions: {
    get: function () {
      var numberWrong = 0;
      numberWrong = numberOfQuestions - numberCorrectQuestions;
      return numberWrong;
    }
  },
  report: {
    get: function () {
      return {
        isCorrect: this.passed,
        questions: this.questions
      };
    }
  }
});

/**
 * Takes in a set of values from the target. Adds to gradebook.
 * @param {object} target - only what the GradeBook needs to know about the Target
 */
GradeBook.prototype.recordQuestion = function (target) {
  target.correct = false;
  this.questions.push(target);
};

GradeBook.prototype.reset = function () {
  this.questions = [];
  this.passed = false;
};

/**
 * Will iterate through all the questions and return if they meet grade criteria
 * @param  {object} config - {string} config.strictness, {boolean} config.not, {function} config.callback
 * @return {boolean} passed - Are enough questions correct to pass the active_test?
 */
GradeBook.prototype.grade = function (config) {
  var strictness, not, callback;
  strictness = config.strictness;
  not = config.not;
  callback = config.callback; // expect that the callback encapsulates any comparison values from us

  this.questions.forEach(function (question) {
    question.correct = callback(question);
    if (not) {
      question.correct = !question.correct;
    }
  });

  switch (strictness) {
    case 'someOf':
      if (this.numberCorrectQuestions < this.numberOfQuestions && this.numberCorrectQuestions > 0) {
        this.passed = true;
      };
      break;
    case 'onlyOneOf':
      if (this.numberCorrectQuestions === 1) {
        this.passed = true;
      };
      break;
    default:
      this.passed = this.allCorrect;
      break;
  };
  return this.report;
};