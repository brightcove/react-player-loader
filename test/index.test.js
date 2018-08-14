import document from 'global/document';
import QUnit from 'qunit';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactBrightcovePlayer from '../src/index.js';

QUnit.module('ReactBrightcovePlayer');

QUnit.test('the environment is sane', function(assert) {
  const done = assert.async();

  assert.expect(2);

  const reactPlayerLoader = ReactDOM.render(
    React.createElement(ReactBrightcovePlayer, {
      accountId: '12345678',
      onFailure(failure) {
        assert.ok(failure, 'failed to download non-existent player');
        done();
      }
    }),
    document.getElementById('qunit-fixture')
  );

  assert.ok(reactPlayerLoader, 'player loader react component created');
});

