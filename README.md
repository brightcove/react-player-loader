# @brightcove/react-player-loader

[![Build Status](https://travis-ci.org/brightcove/react-player-loader.svg?branch=master)](https://travis-ci.org/brightcove/react-player-loader)
[![Greenkeeper badge](https://badges.greenkeeper.io/brightcove/react-player-loader.svg)](https://greenkeeper.io/)

[![NPM](https://nodeico.herokuapp.com/@brightcove/react-player-loader.svg)](https://npmjs.com/package/@brightcove/react-player-loader)

A React component to load a Brightcove Player in the browser.

## Brightcove Player Support

This library has [the same support characteristics as the Brightcove Player Loader](https://github.com/brightcove/player-loader#brightcove-player-support).

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Standard Usage with JSX](#standard-usage-with-jsx)
- [Props](#props)
  - [`attrs`](#attrs)
  - [`baseUrl`](#baseurl)
  - [Other Props](#other-props)
- [Effects of Prop Changes](#effects-of-prop-changes)
- [View the Demo](#view-the-demo)
- [Alternate Usage](#alternate-usage)
  - [ES Module (without JSX)](#es-module-without-jsx)
  - [CommonJS](#commonjs)
  - [`<script>` Tag](#script-tag)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

No matter how you use this component, the only place it is available is npm.

```sh
npm install --save @brightcove/react-player-loader
```

## Standard Usage with JSX

Most React applications are using JSX and the toolchain provided by `create-react-app`.

After installing, `import` the module and use the `ReactPlayerLoader` component like any other component in your React application:

> **NOTE:** `React`/`ReactDOM` are **NOT** required, they are only used here to show a complete working example!

```js
import React from 'react';
import ReactDOM from 'react-dom';
import ReactPlayerLoader from '@brightcove/react-player-loader';

let reactPlayerLoader;
const onSuccess = function(success) {

  // The player object or iframe element (depending on embed type) can be
  // accessed in two ways.
  // 
  // From the success object passed to the `onSuccess` callback:
  console.log(success.ref);

  // As a property of the component instance:
  console.log(reactPlayerLoader.player);
};

reactPlayerLoader = ReactDOM.render(
  <ReactPlayerLoader accountId='1234678' onSuccess={onSuccess}/>,
  document.getElementById('fixture')
);
```

See [Alternate Usage](#alternate-usage) below for less common ways to use this component.

## Props

### `attrs`

Type: `Object`

Provides attributes (props) to the component element.

For example, you may want to customize the `className` of the component (by default, `"brightcove-react-player-loader"`) by setting props on the component like so:

```jsx
<ReactPlayerLoader attrs={{className: 'my-custom-class'}} />
```

### `baseUrl`

Type: `string`

Used to override the base URL for the Brightcove Player being embedded.

Most users will never need this prop. By default, players are loaded from Brightcove's player CDN (`players.brightcove.net`).

### Other Props

All props not specified above are passed to the [Brightcove Player Loader](https://github.com/brightcove/player-loader#parameters) with a few differences:

1. We cannot expose the Player Loader promise easily, so you must use the `onSuccess` and `onFailure` callbacks.
2. If you don't provide an `onFailure` callback, the failure will be handled by throwing an error.
3. We need to use `refNode` and `refNodeInsert` internally, so those props will be ignored.

## Effects of Prop Changes

When a prop passed to this component changes, it will have one of two effects:

1. Dispose/reload the player. This is the most common case.
1. Update the player's state (e.g. fetch a new video).

The following props will update the player's state _without_ a reload:

- `catalogSearch`
- `catalogSequence`
- `playlistId`
- `playlistVideoId`
- `videoId`

All other prop changes will cause a complete dispose/reload.

## View the Demo

This repository includes a barebones demo/example page.

1. Clone the repository
2. Move into the repository
3. Run `npm install`
4. Run `npm start`
5. Navigate to `http://localhost:9999` in a browser

## Alternate Usage

### ES Module (without JSX)

After installation, `import` the module in your JavaScript and use the `ReactPlayerLoader` component like any other component in your React application:

> **NOTE:** `React`/`ReactDOM` are **NOT** required, they are only used here to show a complete working example!

```js
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

### CommonJS

After installation, `require` the module in your JavaScript and use the `ReactPlayerLoader` component like any other component in your React application:

> **NOTE:** `React`/`ReactDOM` are **NOT** required, they are only used here to show a complete working example!

```js
var React = require('react');
var ReactDOM = require('react-dom');
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

### `<script>` Tag

_This case is extremely unlikely to be used._

After installation or loading from a CDN, use a `script` tag to include the module in your HTML and use the global `window.BrightcoveReactPlayerLoader` to construct the component.

```html
<div id="fixture"></div>
<script src="//path/to/react.min.js"></script>
<script src="//path/to/react-dom.min.js"></script>
<script src="//path/to/brightcove-react-player-loader.min.js"></script>
<script>
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  var reactPlayerLoader = ReactDOM.render(
    React.createElement(window.BrightcoveReactPlayerLoader, {
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

[react]: https://www.npmjs.com/package/react
[react-dom]: https://www.npmjs.com/package/react-dom
