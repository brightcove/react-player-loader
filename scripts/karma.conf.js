const generate = require('videojs-generate-karma-config');

module.exports = function(config) {

  // see https://github.com/videojs/videojs-generate-karma-config
  // for options
  const options = {
    files(defaults) {
      // defaults don't work for this project
      return [
        'node_modules/sinon/pkg/sinon.js',
        'node_modules/react/umd/react.development.js',
        'node_modules/react-dom/umd/react-dom.development.js',
        'test/dist/bundle.js'
      ];
    }
  };

  config = generate(config, options);

  // any other custom stuff not supported by options here!
};

