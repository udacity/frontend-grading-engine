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

var injectJsFiles = [
  'src/app/js/inject/intro.js',
  'src/app/js/inject/helpers.js',
  'src/app/js/inject/StateManager.js',
  'src/app/js/inject/inject.js',
  'src/app/js/inject/outro.js'
];

var webComponents = [
  'src/webcomponents/intro.html',
  'src/webcomponents/active-test.html',
  'src/webcomponents/test-results.html',
  'src/webcomponents/test-suite.html',
  'src/webcomponents/test-widget.html',
  'src/webcomponents/outro.html',
];

var components = [
  'src/app/test_widget/js/components.js',
  'src/app/test_widget/js/test_suite.js',
  'src/app/test_widget/js/test_results.js',
  'src/app/test_widget/js/active_test.js',
  'src/app/test_widget/js/test_widget.js'
];

var ui_v2 = [
  'src/app/test_widget/test_widget.html',
  'src/app/test_widget/test_widget.css'
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

// Native components (see components.js)
gulp.task('components', function() {
  return gulp.src(components)
    .pipe(concat('components.js'))
    .pipe(gulp.dest(build + 'ext/app/templates/'))
    .pipe(debug({title: 'built components: '}));
});

// This is the iFrame document
gulp.task('ui_v2', function() {
  return gulp.src(ui_v2)
  .pipe(gulp.dest(build + 'ext/app/templates/'))
  .pipe(debug({title: 'built user interface v2: '}));
});

gulp.task('icons', function() {
  return gulp.src(iconFiles)
    .pipe(gulp.dest(build + 'ext/icons/'))
    .pipe(debug({title: 'copied icons:'}));
});

// Browser independent procedures
gulp.task('GE', function() {
  return gulp.src(jsFiles)
    .pipe(concat('GE.js'))
    .pipe(gulp.dest(build + 'ext/app/js/libs/'))
    .pipe(debug({title: 'built dev grading engine:'}));
});

gulp.task('inject', function() {
  return gulp.src(injectJsFiles)
    .pipe(concat('inject.js'))
    .pipe(gulp.dest(build + 'ext/app/js/'))
    .pipe(debug({title: 'build inject.js:'}));
});

// Temporary solution. App should be refactored with ui.
gulp.task('app', function() {
  return gulp.src('src/app/**/*')
    .pipe(gulp.dest(build + 'ext/app/'))
    .pipe(debug({title: 'copied app files:'}));
});

gulp.task('chromium', ['app'], function() {
  return gulp.src('chromium/manifest.json')
    .pipe(gulp.dest(build + 'ext/'))
    .pipe(debug({title: 'copied Chromium’s manifest:'}));
});

gulp.task('default', ['chromium', 'ui', 'inject', 'ui_v2', 'components', 'icons', 'GE']);

gulp.task('watch', function() {
  gulp.start('default');
  watch(allFiles, batch(function(events, done) {
    gulp.start('default', done);
  }));
});
