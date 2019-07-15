const generate = require('videojs-generate-rollup-config');

// see https://github.com/videojs/videojs-generate-rollup-config
// for options
const options = {
  input: 'src/index.js',
  distName: 'brightcove-react-player-loader',
  exportName: 'BrightcoveReactPlayerLoader',
  externals(defaults) {
    return {
      browser: defaults.browser.concat([
        'react'
      ]),
      module: defaults.module.concat([
        'react'
      ]),
      test: defaults.test.concat([
        'react',
        'react-dom'
      ])
    };
  },
  globals(defaults) {
    return {
      browser: Object.assign(defaults.browser, {
        react: 'React'
      }),
      module: defaults.module,
      test: Object.assign(defaults.test, {

        // This is a deep dependency of @testing-library/react that doesn't
        // play nice with Rollup...
        '@sheerun/mutationobserver-shim': 'MutationObserver',
        'react': 'React',
        'react-dom': 'ReactDOM'
      })
    };
  }
};

const config = generate(options);

// Add additonal builds/customization here!

// export the builds to rollup
export default Object.values(config.builds);
