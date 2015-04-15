module.exports = function(grunt) {

  grunt.initConfig({
    removelogging: {
      dist: {
        src: "ud-grading-engine-v0.1-dev.js",
        dest: "ud-grading-engine-v0.1.js",
        options: {
          
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-remove-logging");
  grunt.registerTask('default', ['grunt-remove-logging']);
};