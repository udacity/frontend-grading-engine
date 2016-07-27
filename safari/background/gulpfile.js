var gulp = require('gulp');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var batch = require('gulp-batch');

// Files to watch
var backgroundFiles = [
  'helpers.js',
  'registry.js',
  'adapter.js',
  'adapterListener.js',
  'background.js'
];

// "background" = Build the background script
gulp.task('background', function() {
  return gulp.src(backgroundFiles)
    .pipe(concat('global.js'))
    .pipe(gulp.dest('./'))
    .pipe(debug({title: 'built global page:'}));
});

gulp.task('default', ['background']);

gulp.task('watch', function() {
  gulp.start('default');
  watch(backgroundFiles, batch(function(events, done) {
    gulp.start('default', done);
  }));
});
