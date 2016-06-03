var gulp = require('gulp');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var batch = require('gulp-batch');
var uglify = require('gulp-uglify');

var build = 'build/';

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
];

var iconFiles = 'src/icons/*.png';

var allFiles = jsFiles.concat(webComponents);

// User interface for Chrome. It should be refactored to work on all browsers.
gulp.task('ui', function() {
  return gulp.src(webComponents)
    .pipe(concat('feedback.html'))
    .pipe(gulp.dest(build + 'ext/app/templates/'))
    .pipe(debug({title: 'built feedback: '}));
});

gulp.task('icons', function() {
  return gulp.src(iconFiles)
    .pipe(gulp.dest(build + 'ext/icons/'))
    .pipe(debug({title: 'copied icons: '}));
});

// Browser independent procedures
gulp.task('GE', function() {
  return gulp.src(jsFiles)
    .pipe(concat('GE.js'))
    .pipe(gulp.dest(build + 'ext/app/js/libs/'))
    .pipe(debug({title: 'built dev grading engine:'}));
});

gulp.task('chromium', function() {
  return gulp.src('chromium/manifest.json')
    .pipe(gulp.dest(build + 'ext/'))
    .pipe(debug({title: 'copied Chromium’s manifest:'}));
});

gulp.task('default', ['chromium', 'ui', 'icons', 'GE']);

gulp.task('watch', function() {
  gulp.start('default');
  watch(allFiles, batch(function(events, done) {
    gulp.start('default', done);
  }));
});
