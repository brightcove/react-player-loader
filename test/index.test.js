import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactPlayerLoader from '../src/index.js';
import BrightcovePlayerLoader from '@brightcove/player-loader';

QUnit.module('ReactPlayerLoader', {
  beforeEach() {
    this.fixture = document.getElementById('qunit-fixture');
    this.originalBaseUrl = BrightcovePlayerLoader.getBaseUrl();
    BrightcovePlayerLoader.setBaseUrl(`${window.location.origin}/vendor/`);
  },
  afterEach() {
    // reset the base url
    BrightcovePlayerLoader.setBaseUrl(this.originalBaseUrl);

    // unmount all components on the fixture
    ReactDOM.unmountComponentAtNode(this.fixture);
  }
});

QUnit.test('failure', function(assert) {
  const done = assert.async();

  assert.expect(2);

  const reactPlayerLoader = ReactDOM.render(
    React.createElement(ReactPlayerLoader, {
      accountId: '2',
      onFailure: (failure) => {
        assert.ok(failure, 'failed to download non-existent player');
        done();
      }
    }),
    this.fixture
  );

  assert.ok(reactPlayerLoader, 'player loader react component created');
});

QUnit.test('success', function(assert) {
  const done = assert.async();

  assert.expect(2);

  const reactPlayerLoader = ReactDOM.render(
    React.createElement(ReactPlayerLoader, {
      accountId: '1',
      onSuccess: ({ref, type}) => {
        assert.ok(ref, 'downloaded and created a player');
        done();
      }
    }),
    this.fixture
  );

  assert.ok(reactPlayerLoader, 'player loader react component created');
});

QUnit.test('unmount after success', function(assert) {
  const done = assert.async();

  assert.expect(2);

  const reactPlayerLoader = ReactDOM.render(
    React.createElement(ReactPlayerLoader, {
      accountId: '1',
      onSuccess: ({ref, type}) => {
        assert.ok(ref, 'downloaded and created a player');
        window.setTimeout(() => {
          ReactDOM.unmountComponentAtNode(this.fixture);
          done();
        }, 1);
      }
    }),
    this.fixture
  );

  assert.ok(reactPlayerLoader, 'player loader react component created');
});

QUnit.test('attrs', function(assert) {
  const done = assert.async();

  assert.expect(1);

  ReactDOM.render(
    React.createElement(ReactPlayerLoader, {
      accountId: '1',
      attrs: {foo: 'bar'},
      onSuccess: ({ref, type}) => {
        window.setTimeout(() => {
          ReactDOM.unmountComponentAtNode(this.fixture);
          done();
        }, 1);
      }
    }),
    this.fixture
  );

  assert.ok(this.fixture.querySelector('div[foo="bar"]'), 'foo="bar" div exists');
});

