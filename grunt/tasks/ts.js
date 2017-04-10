module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-ts');

    grunt.config('ts.source', {
        tsconfig: {
            passThrough: true
        }
    }); 

    grunt.config('ts.test', {
        tsconfig: {
            tsconfig: './tsconfig.test.json',
            passThrough: true
        }
    }); 

};

