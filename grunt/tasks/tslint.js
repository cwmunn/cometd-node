module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-tslint');

    grunt.config('tslint.source', {
      options: {
        configuration: "grunt/config/tslint.json"
      },
      files: {
        src: ["src/**/*.ts", "!src/**/**.d.ts"]
      }
    });

    grunt.config('tslint.test', {
      options: {
        configuration: "grunt/config/tslint.test.json"
      },
      files: {
        src: ["test/**/*.ts"]
      }
    });

};
