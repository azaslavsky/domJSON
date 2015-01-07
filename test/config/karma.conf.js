// Karma configuration
// Generated on Mon Dec 08 2014 23:58:11 GMT-0800 (Pacific Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'jasmine-matchers'],


    // list of files / patterns to load in the browser
    files: [
      'test/lib/polyfill/*.js',
      'test/lib/jquery-1.11.2.min.js',
      'src/**/*.js',
      'test/spec/**/*.js',
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'html'],


    // jasmein html reports
    htmlReporter: {
      outputFile: 'test/results/compatibility.html',
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'ChromeCanary', 'Firefox', 'FirefoxDeveloper', 'IE11', 'IE10', 'IE9'], // Compatibility tests


    // browser latency settings
    browserDisconnectTimeout: 1000,
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 6000,


    // enable ie emulation
    customLaunchers: {
      IE11: {
        base: 'IE',
        'x-ua-compatible': 'IE=edge'
      },
      IE10: {
        base: 'IE',
        'x-ua-compatible': 'IE=10'
      },
      IE9: {
        base: 'IE',
        'x-ua-compatible': 'IE=9'
      }
    },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
