var gulp = require('gulp'),
    watch = require('gulp-watch'),
    concat = require('gulp-continuous-concat'),
    debug = require('gulp-debug');

var jsFiles = [
  'src/js/intro.js',
  'src/js/helpers.js',
  'src/js/load_widget.js',
  'src/js/engine.js',
  'src/js/registrar.js',
  'src/js/outro.js'
]

gulp.task('watch', function() {
  gulp.src(jsFiles)
    .pipe(watch(jsFiles))
    .pipe(concat('udgrader-003.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(debug({title: 'rebuild:'}))
});