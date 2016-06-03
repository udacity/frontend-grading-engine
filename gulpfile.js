var gulp = require('gulp');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var batch = require('gulp-batch');
var uglify = require('gulp-uglify');

var jsFiles = [
  'src/js/intro.js',
  'src/js/helpers.js',
  'src/js/Queue.js',
  'src/js/Target.js',
  'src/js/GradeBook.js',
  'src/js/TACollectors.js',
  'src/js/TAReporters.js',
  'src/js/ActiveTest.js',
  'src/js/Suite.js',
  'src/js/registrar.js',
  'src/js/outro.js'
];

var webComponents = [
  'src/webcomponents/intro.html',
  'src/webcomponents/active-test.html',
  'src/webcomponents/test-results.html',
  'src/webcomponents/test-suite.html',
  'src/webcomponents/test-widget.html',
  'src/webcomponents/outro.html',
]

var allFiles = jsFiles.concat(webComponents);

gulp.task('concat', function () {
  return gulp.src(webComponents)
    .pipe(concat('feedback.html'))
    .pipe(gulp.dest('ext/app/templates/'))
    .pipe(debug({title: 'built feedback: '}))
});

gulp.task('GE', function() {
  return gulp.src(jsFiles)
    .pipe(concat('GE.js'))
    .pipe(gulp.dest('ext/app/js/libs/'))
    .pipe(debug({title: 'built dev grading engine:'}))
});

gulp.task('default', ['concat', 'GE']);

gulp.task('watch', function () {
  gulp.start('default');
  watch(allFiles, batch(function (events, done) {
    gulp.start('default', done);
  }));
});
