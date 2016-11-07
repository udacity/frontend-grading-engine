var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var batch = require('gulp-batch');
// var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var mv = require('mv');

var currentBrowser;

var build = './build/%target%/ext/';

var log = function(message) {
  console.log('\x1b[37;46m####       ' + message + '\x1b[0;m');
};

function setBrowser(browser) {
  currentBrowser = browser;
  return log('Set ' + currentBrowser + ' as the current browser');
}

var pageFiles = {
  gradingEngine: {
    src: [
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
    ],
    libraries: {
      src: 'src/app/js/libs/*.js',
      dest: build + 'app/js/libs/'
    },
    concat: 'GE.js',
    dest: build + 'app/js/libs/'
  },
  libraries: {
    src: 'lib/*',
    dest: build + 'lib/'
  },
  background: {
    js: {
      src: [
        '%target%/background.js'
      ],
      concat: 'background.js'
    },
    dest: build
  },
  inject: {
    src: [
      '%target%/inject/intro.js',
      'src/app/js/inject/helpers.js',
      'src/app/js/inject/StateManager.js',
      'src/app/js/inject/inject.js',
      '%target%/inject/outro.js'
    ],
    concat: 'inject.js',
    dest: build + 'app/js/'
  },
  templates: {
    src: [
      'src/app/test_widget/font.js',
      'src/app/test_widget/test_suite.js',
      'src/app/test_widget/test_results.js',
      'src/app/test_widget/active_test.js',
      'src/app/test_widget/test_widget.js'
    ],
    concat: 'templates.js',
    dest: build + 'app/templates/'
  },
  // Safari background script
  globalPage: {
    js: {
      src: [
        '%target%/background/helpers.js',
        '%target%/background/registry.js',
        '%target%/background/adapter.js',
        '%target%/background/adapterListener.js',
        '%target%/background/background.js'
      ],
      concat: 'background.js'
    },
    html: {
      src: [
        '%target%/background/background.html'
      ],
      concat: 'background.html'
    },
    dest: build
  }
};

var gradingEngine = pageFiles.gradingEngine;
// Third-party libraries
var libraries = pageFiles.libraries;
var geLibs = gradingEngine.libraries;
var background = pageFiles.background;
var global = pageFiles.globalPage;
var inject = pageFiles.inject;
var templates = pageFiles.templates;

var browserPageFiles = {
  pageAction: {
    html: 'src/app/browser_action/browser_action.html',
    js: {
      src: [
        '%target%/browser_action/intro.js',
        'src/app/browser_action/browser_action.js',
        '%target%/browser_action/outro.js'
      ],
      concat: 'browser_action.js'
    },
    dest: build + 'app/browser_action/'
  },
  pageOptions: {
    html: 'src/app/options/index.html',
    js: {
      src: [
        '%target%/options/intro.js',
        'src/app/options/options.js',
        '%target%/options/outro.js'
      ],
      concat: 'options.js'
    },
    dest: build + 'app/options/'
  }
};
var pageAction = browserPageFiles.pageAction;
var pageOptions = browserPageFiles.pageOptions;

var iconFiles = {
  src: [
    'src/icons/icon.png',
    'src/icons/Icon-32.png',
    'src/icons/Icon-48.png',
    'src/icons/Icon-64.png',
    'src/icons/Icon-128.png'
  ],
  dest: build + 'icons/'
};

var styleFiles = {
  src: [
    'src/app/css/common.css',
    'src/app/css/fonts.css',
    'src/app/css/ui.css',
    'src/app/css/options.css'
  ],
  dest: build + 'app/css/'
};

var fontFiles = {
  src: 'src/app/css/fonts/fontawesome-webfont.ttf',
  dest: build + 'app/css/fonts/'
};

// Files to watch
var allFiles = gradingEngine.src.concat(templates.src, inject.src, background.js.src, global.js.src);

// "GE" = Build the GradingEngine library.
gulp.task('GE', function() {
  return gulp.src(gradingEngine.src)
    .pipe(concat(gradingEngine.concat))
    .pipe(gulp.dest(gradingEngine.dest))
    .pipe(debug({title: 'built the grading engine:'}));
});

// "GE_libs" = Copy libraries of the Grading Engine.
gulp.task('GE_libs', function() {
  return gulp.src(geLibs.src)
    .pipe(gulp.dest(geLibs.dest))
    .pipe(debug({title: 'copied grading engine libraries:'}));
});

// "libraries" = Copy third-party libraries.
gulp.task('libraries', function() {
  return gulp.src(libraries.src)
    .pipe(gulp.dest(libraries.dest))
    .pipe(debug({title: 'copied libraries:'}));
});

// "templates" = Generate the native templates. There were
// previously Web Templates.
gulp.task('templates', function() {
  return gulp.src(templates.src)
    .pipe(concat(templates.concat))
    .pipe(gulp.dest(templates.dest))
    .pipe(debug({title: 'built templates: '}));
});

// "inject" = Generate the inject script for the current browser and copy.
gulp.task('inject', function() {
  var files = inject.src.map(function(x) {
    return x.replace('%target%', currentBrowser);
  });
  return gulp.src(files)
    .pipe(concat(inject.concat))
    .pipe(gulp.dest(inject.dest))
    .pipe(debug({title: 'built inject.js:'}));
});

/*** PAGEACTION ***/
// "_pageAction_html" = Copy HTML options page.
gulp.task('_pageAction_html', function() {
  return gulp.src(pageAction.html)
    .pipe(gulp.dest(pageAction.dest))
    .pipe(debug({title: 'copied action page:'}));
});

// "_pageAction_js" = Generate the pageAction script for the current browser and copy.
gulp.task('_pageAction_js', function() {
  var files = pageAction.js.src.map(function(x) {
    return x.replace('%target%', currentBrowser);
  });
  return gulp.src(files)
    .pipe(concat(pageAction.js.concat))
    .pipe(gulp.dest(pageAction.dest))
    .pipe(debug({title: 'built action page script:'}));
});

// "pageAction" = Copy the `browser_action` files.
gulp.task('pageAction', ['_pageAction_html', '_pageAction_js']);
/*** PAGEACTION ends here ***/

/*** PAGEOPTIONS ***/
// "_pageOptions_html" = Copy HTML options page.
gulp.task('_pageOptions_html', function() {
  return gulp.src(pageOptions.html)
    .pipe(gulp.dest(pageOptions.dest))
    .pipe(debug({title: 'copied options page:'}));
});

// "_pageOptions_js" = Generate the pageAction script for the current browser and copy.
gulp.task('_pageOptions_js', function() {
  var files = pageOptions.js.src.map(function(x) {
    return x.replace('%target%', currentBrowser);
  });
  return gulp.src(files)
    .pipe(concat(pageOptions.js.concat))
    .pipe(gulp.dest(pageOptions.dest))
    .pipe(debug({title: 'built options page script:'}));
});

// "pageOptions" = Copy the options page.
gulp.task('pageOptions', ['_pageOptions_html', '_pageOptions_js']);
/*** PAGEOPTIONS ends here ***/


// "icons" = Copy icons.
gulp.task('icons', function() {
  if(currentBrowser === 'safari') {
    iconFiles.src.push('safari/toolbar_icon.png');
    iconFiles.dest = build;
  }
  return gulp.src(iconFiles.src)
    .pipe(gulp.dest(iconFiles.dest))
    .pipe(debug({title: 'copied icons:'}));
});

// "styles" = Copy styles.
gulp.task('styles', function() {
  return gulp.src(styleFiles.src)
    .pipe(gulp.dest(styleFiles.dest))
    .pipe(debug({title: 'copied styles:'}));
});

// "fonts" = Copy fonts.
gulp.task('fonts', function() {
  return gulp.src(fontFiles.src)
    .pipe(gulp.dest(fontFiles.dest))
    .pipe(debug({title: 'copied fonts:'}));
});

// "assets" = Executes tasks for static assets.
gulp.task('assets', ['icons', 'styles', 'fonts']);

// "app" = Executes tasks for the app (view).
gulp.task('app', ['templates', 'inject', 'pageAction', 'pageOptions', 'assets']);

// "extension" = Executes tasks that are mostly not browser specific.
gulp.task('extension', ['app', 'GE', 'GE_libs', 'libraries']);

// "background-script" = Copy the background script for the
// `currentBrowser` (if any).
gulp.task('background-script', function() {
  var _background = currentBrowser === 'safari' ? global : background;
  _background.js.src = _background.js.src.map(function(x) {
    return x.replace('%target%', currentBrowser);
  });
  log(_background);
  return gulp.src(_background.js.src)
    .pipe(concat(_background.js.concat))
    .pipe(gulp.dest(_background.dest))
    .pipe(debug({title: 'copied ' + currentBrowser + '’s background script:'}));
});

// "background-page" = Copy the background page for the
// `currentBrowser` (if any).
gulp.task('background-page', function() {
  var _background = currentBrowser === 'safari' ? global : background;
  _background.html.src = _background.html.src.map(function(x) {
    return x.replace('%target%', currentBrowser);
  });
  return gulp.src(_background.html.src)
    .pipe(concat(_background.html.concat))
    .pipe(gulp.dest(_background.dest))
    .pipe(debug({title: 'copied ' + currentBrowser + '’s background page:'}));
});

// "manifest" = Copy the manifest for the current browser
gulp.task('manifest', function() {
  // Safari doesn’t have a `manifest.json`, but an `Info.plist`
  var manifest = currentBrowser === 'safari' ? 'Info.plist' : 'manifest.json';
  return gulp.src(currentBrowser + '/' + manifest)
    .pipe(gulp.dest(build))
    .pipe(debug({title: 'copied ' + currentBrowser +'’s manifest:'}));
});

// "_chromium" = Sets currentBrowser to chromium.
gulp.task('_chromium', function() {
  return setBrowser('chromium');
});

// "_firefox" = Sets currentBrowser to firefox
gulp.task('_firefox', function() {
  return setBrowser('firefox');
});

// "_safari" = Sets currentBrowser to safari
gulp.task('_safari', function() {
  return setBrowser('safari');
});

// "move-build" = Move build files to its target directory.
gulp.task('move-build', function() {
  var browserBuild = build.replace('%target%/ext/', currentBrowser + '/');
  mv(build.replace('ext/', ''), browserBuild, {mkdirp: true}, function(err) {
    console.log(err);
  });
  return log('Moved ' + currentBrowser + ' files to: ' + browserBuild);
});

// "chromium" = Run chromim dependencies to build the extension.
gulp.task('chromium', gulpsync.sync(['_chromium', ['manifest', 'extension'], 'move-build']));

// "firefox" = Run Firefox dependencies to build the extension.
gulp.task('firefox', gulpsync.sync(['_firefox', ['manifest', 'background-script', 'extension'], 'move-build']));

// "safari" = Run Safari dependencies to build the extension.
gulp.task('safari', gulpsync.sync(['_safari', ['manifest', 'background-script', 'background-page', 'extension'], 'move-build']));

// "clean" = Clean the build directory. Otherwise `mv` would throw an error.
gulp.task('clean', function() {
  log('Cleaned the build directory');
  return gulp.src('./build/', {read: false})
    .pipe(clean())
    .pipe(debug({title: 'cleaned ' + build}));
});

gulp.task('default', gulpsync.sync(['clean', 'firefox', 'chromium', 'safari']));

gulp.task('watch', function() {
  gulp.start('default');
  watch(allFiles, batch(function(events, done) {
    gulp.start('default', done);
  }));
});
