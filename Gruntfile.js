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
          'src/js/load_engine.js',
          'src/js/engine.js',
          'src/js/registrar.js',
          'src/js/outro.js'
        ],
        dest: 'dist/udgrader-003.js'
      }
    }
  });

  // grunt.loadNpmTasks("grunt-remove-logging");
  // grunt.registerTask('default', ['grunt-remove-logging']);
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
};