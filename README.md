# @brightcove/react-player-loader
A React component to load a brightcove player in the browser.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Installation

- [Installation](#installation)
- [Usage](#usage)
  - [JSX](#jsx)
  - [Via `<script>` Tags](#via-script-tags)
  - [CommonJS](#commonjs)
  - [ES Module](#es-module)
- [Options](#options)
  - [View the Demo](#view-the-demo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save @brightcove/react-player-loader
```

## Usage

To include `@brightcove/react-player-loader` on your website or web application, use any of the following methods.

### JSX

1. Install the module (see [Installation](##Installation))
2. `import` the module in your javascript. IE `import ReactPlayerLoader from '@brightcove/react-player-loader'`
3. Now you can use it however you like, with the `ReactPlayerLoader` variable.
4. See the example below for full usage.

> NOTE: React/ReactDOM/global are **NOT** required, they are only used to show a working example.

```js
import document from 'global/document';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactPlayerLoader from '@brightcove/react-player-loader';

let reactPlayerLoader;
const onSuccess = function(success) {
  // two ways to get the underlying player/iframe at this point.
  console.log(success.ref)
  console.log(reactPlayerLoader.player);
};

reactPlayerLoader = ReactDOM.render(
  <ReactPlayerLoader accountId='1234678' onSuccess={onSuccess}/>,
  document.getElementById('fixture')
);

```

### Via `<script>` Tags

1. Get the script however you prefer
2. Include the script in your html
3. Use the `BrightcoveReactPlayerLoader` object that this module exports on the `window` object.
4. See the example below for full usage.

> NOTE: React/ReactDOM are **NOT** required, they are only used to show a working example.

```html
<div id='fixture'></div>
<script src="//path/to/react.min.js"></script>
<script src="//path/to/react-dom.min.js"></script>
<script src="//path/to/brightcove-react-player-loader.min.js"></script>
<script>

  var React = window.React;
  var ReactDOM = window.ReactDOM;
  var ReactPlayerLoader = window.BrightcoveReactPlayerLoader;

  var reactPlayerLoader = window.reactPlayerLoader = ReactDOM.render(
    React.createElement(ReactPlayerLoader, {
      accountId: '1234678',
      onSuccess: function(success) {
        // two ways to get the underlying player/iframe at this point.
        console.log(success.ref)
        console.log(reactPlayerLoader.player);
      }
    }),
    document.getElementById('fixture')
  );

</script>
```

### CommonJS

1. Install the module (see [Installation](##Installation))
2. `require` the module in your javascript. IE `var ReactPlayerLoader = require('@brightcove/react-player-loader')`
3. Now you can use it however you like, with the `ReactPlayerLoader` variable.
4. See the example below for full usage.

> NOTE: React/ReactDOM/global are **NOT** required, they are only used to show a working example.

```js
var React = require('react');
var ReactDOM = require('react-dom');
var document = require('global/document');
var ReactPlayerLoader = require('@brightcove/react-player-loader');

var reactPlayerLoader = ReactDOM.render(
  React.createElement(ReactPlayerLoader, {
    accountId: '1234678',
    onSuccess: function(success) {
      // two ways to get the underlying player/iframe at this point.
      console.log(success.ref)
      console.log(reactPlayerLoader.player);
    }
  }),
  document.getElementById('fixture')
);

```

### ES Module

1. Install the module (see [Installation](##Installation))
2. `import` the module in your javascript. IE `import ReactPlayerLoader from '@brightcove/react-player-loader'`
3. Now you can use it however you like, with the `ReactPlayerLoader` variable.
4. See the example below for full usage.

> NOTE: React/ReactDOM/global are **NOT** required, they are only used to show a working example.

```js
import document from 'global/document';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactPlayerLoader  from '@brightcove/react-player-loader';

const reactPlayerLoader = ReactDOM.render(
  React.createElement(ReactPlayerLoader, {
    accountId: '1234678',
    onSuccess(success) {
      // two ways to get the underlying player/iframe at this point.
      console.log(success.ref)
      console.log(reactPlayerLoader.player);
    }
  }),
  document.getElementById('fixture')
);

```

## Options
See the [player loader page](https://github.com/brightcove/player-loader#parameters) for most options. There are four differences
1. We cannot export the promise easily, so you will have to use the `onSuccess` and `onFailure` callbacks
2. If you don't provide an `onFailure` callback the failure will be handle by throwing an error
3. We need to use `refNode` and `refNodeInsert` internally, so those options will not be used if passed in.
4. We allow a `baseUrl` string option, so that the baseUrl can be changed. Player loader makes you use `setBaseUrl()` which you won't have access to.

### View the Demo
1. clone the repo
2. move into the repo
3. run `npm i`
4. run `npm run start`
5. Navigate to `http://localhost:9999` in the browser

[react]: https://www.npmjs.com/package/react
[react-dom]: https://www.npmjs.com/package/react-dom
