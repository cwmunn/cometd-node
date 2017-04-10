module.exports = function(grunt) {
  var argv = require('optimist').argv;

  grunt.loadNpmTasks('grunt-mocha-istanbul-extra');

  global.assert = require('chai').assert;

  let withOptionsKeys = Object.keys(argv).filter(key => key.startsWith('with-'))
  let withOptions = [];
  for (key of withOptionsKeys) {
    withOptions.push(key.replace(/^with-/, '--'));
    withOptions.push(argv[key]);
  }

  var getOptions = function getOptions() {
    var options = {
      mask: 'specs/**/*.spec.js',
      reportFormats: ['lcov'],
      coverageFolder: 'target/reports/core/coverage/node',
      extraOptions: withOptions
    };

    if (argv.grep) {
      options.mochaOptions = ['--grep', argv.grep]
    } else {
      options.check = {
        statements: 10,
        branches: 10,
        functions: 10,
        lines: 10
      };
    }

    return options;
  };

  grunt.config('mocha_istanbul', {
    // Configure a mochaTest task
    ts: {
      src: 'target/test',
      options: getOptions()
    },
    integration: {
      src: 'test',
      options: {
        mask: 'integration/**/*.js',
        reportFormats: ['lcov'],
        coverageFolder: 'target/reports/integration/coverage/node',
      }
    }
  });

};
