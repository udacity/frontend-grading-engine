module.exports = function(grunt) {

  grunt.initConfig({
    // removelogging: {
    //   dist: {
    //     src: "ud-grading-engine-v0.1-dev.js",
    //     dest: "ud-grading-engine-v0.1.js",
    //     options: {
          
    //     }
    //   }
    // },
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
    }
    // watch: {
    //   concat: {
    //     files: 'src/js/*.js',
    //     tasks: 'concat'
    //   }
    // }
  });

  // grunt.loadNpmTasks("grunt-remove-logging");
  // grunt.registerTask('default', ['grunt-remove-logging']);
  grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['concat']);
  // grunt.registerTask('watch', ['watch']);
};