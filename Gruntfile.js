/* not in use! */

module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      dist: {
        src: [
          'src/js/intro.js',
          'src/js/helpers.js',
          'src/js/load_widget.js',
          'src/js/engine.js',
          'src/js/registrar.js',
          'src/js/outro.js'
        ],
        dest: 'dist/udgrader-003.js'
      }
    },
    watch: {
      scripts: {
        files: ['**/*.js'],
        tasks: ['default']
      }
    }
  });
  // grunt.event.on('watch', function(action, filepath, target) {
  //   grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  // });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat']);
  grunt.registerTask('watch', ['watch']);
};