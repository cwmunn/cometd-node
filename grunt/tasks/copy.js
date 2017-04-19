module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');

  const path = require('path');
  const dest = './target/build/';

  grunt.config('copy', {
    webapp: {
        files: [
            {cwd: 'src/static', src: '**', dest: path.resolve(dest, 'testapp'), expand: true}
        ]
    }
  });
};
