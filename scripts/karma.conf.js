const generate = require('videojs-generate-karma-config');

module.exports = function(config) {
  config = generate(config);

  config.files = [
    'node_modules/react/umd/react.development.js',
    'node_modules/react-dom/umd/react-dom.development.js',
    'test/dist/bundle.js'
  ];
};
