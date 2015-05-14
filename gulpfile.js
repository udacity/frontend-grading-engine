var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require('gulp-continuous-concat'),
    // singleConcat = require('gulp-concat'),
    debug = require('gulp-debug'),
    replace = require('gulp-replace');

var jsFiles = [
  'src/js/intro.js',
  'src/js/helpers.js',
  'src/js/load_widget.js',
  'src/js/engine.js',
  'src/js/registrar.js',
  'src/js/outro.js'
];

gulp.task('watch-dev', function() {
  gulp.src(jsFiles)
    .pipe(watch(jsFiles))
    .pipe(concat('udgrader-003.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(debug({title: 'rebuild for dev:'}))
});

gulp.task('watch-prod', function() {
  gulp.src(jsFiles)
    .pipe(watch(jsFiles))
    .pipe(concat('udgrader-prod.js'))
    .pipe(replace('/frontend-grading-engine/', 'http://udacity.github.io/frontend-grading-engine/'))
    .pipe(gulp.dest('dist/'))
    .pipe(debug({title: 'rebuild for prod:'}))
});

// not working?
gulp.task('prod', function() {
  return gulp.src(jsFiles)
    .pipe(singleConcat('udgrader-prod.js'))
    .pipe(replace('/frontend-grading-engine/', 'http://udacity.github.io/frontend-grading-engine/'))
    .pipe(gulp.dest('dist/'))
    .pipe(debug({title: 'rebuild for prod:'}))
});