# ReactBrightcovePlayer
A React component to load a brightcove player in the browser.

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->
## Installation

```sh
npm install --save react-brightcove-player
```

## Usage

To include `react-brightcove-player` on your website or web application, use any of the following methods.

### Via `<script>` Tags

Get the script however you prefer. The `ReactBrightcovePlayer` component will be exported on the global `window` object. From there you can render it with `react` and `react-dom`, but those are not required to include the component on the page.

> NOTE: Again React/ReactDOM are **NOT** required, they are only used to show a working example.

```html
<div id='fixture'></div>
<script src="//path/to/react.min.js"></script>
<script src="//path/to/react-dom.min.js"></script>
<script src="//path/to/react-brightcove-player.min.js"></script>
<script>

  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var ReactBrightcovePlayer = window.ReactBrightcovePlayer;

  var reactBrightcovePlayer = window.reactBrightcovePlayer = ReactDOM.render(
    React.createElement(ReactBrightcovePlayer, {
      accountId: '1234678',
      onSuccess: function(success) {
        // two ways to get the underlying player/iframe at this point.
        console.log(success.ref)
        console.log(reactBrightcovePlayer.state.player);
      }
    }),
    document.getElementById('fixture')
  );

</script>
```

### CommonJS

When using with Browserify/rollup/webpack, install via npm and `require` the plugin as you would any other module.

> NOTE: React/ReactDOM/global are **NOT** required, they are only used to show a working example.

```js
var React = require('react');
var ReactDOM = require('react-dom');
var document = require('global/document');
var ReactBrightcovePlayer = require('react-brightcove-player');


var reactBrightcovePlayer = ReactDOM.render(
  React.createElement(ReactBrightcovePlayer, {
    accountId: '1234678',
    onSuccess: function(success) {
      // two ways to get the underlying player/iframe at this point.
      console.log(success.ref)
      console.log(reactBrightcovePlayer.state.player);
    }
  }),
  document.getElementById('fixture')
);

```

### ES Module

When using with Browserify/rollup/webpack, install via npm and `import` the plugin as you would any other module.

> NOTE: React/ReactDOM/global are **NOT** required, they are only used to show a working example.

```js
import document from 'global/document';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactBrightcovePlayer  from 'react-brightcove-player';

const reactBrightcovePlayer = ReactDOM.render(
  React.createElement(ReactBrightcovePlayer, {
    accountId: '1234678',
    onSuccess(success) {
      // two ways to get the underlying player/iframe at this point.
      console.log(success.ref)
      console.log(reactBrightcovePlayer.state.player);
    }
  }),
  document.getElementById('fixture')
);

```

### JSX

When using with Browserify/rollup/webpack, install via npm and `import` the plugin as you would any other module.

> NOTE: React/ReactDOM/global are **NOT** required, they are only used to show a working example.

```js
import document from 'global/document';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactBrightcovePlayer  from 'react-brightcove-player';

let reactBrightcovePlayer;
const onSuccess = function(success) {
  // two ways to get the underlying player/iframe at this point.
  console.log(success.ref)
  console.log(reactBrightcovePlayer.state.player);
};

reactBrightcovePlayer = ReactDOM.render(
  <ReactBrightcovePlayer accountId='1234678' onSuccess={onSuccess}/>,
  document.getElementById('fixture')
);

```


## Options
See the [player loader page](https://github.com/brightcove/player-loader#parameters) for individual options. There are three caveats.
1. We cannot export the promise easily, so you will have to use the `onSuccess` and `onFailure` callbacks
2. If you don't provide an `onFailure` callback the failure will be handle by throwing an error
2. We need to use `refNode` and `refNodeInsert` internally, so those options will not be used if passed in.

### View the Demo
1. clone the repo
2. move into the repo
3. run `npm i`
4. edit index.html and change `REPLACE_ME` for the `accountId` to something valid
5. run `npm run start`
6. Navigate to `http://localhost:9999` in the browser

[react]: https://www.npmjs.com/package/react
[react-dom]: https://www.npmjs.com/package/react-dom
