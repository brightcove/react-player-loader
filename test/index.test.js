import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import {render, cleanup} from '@testing-library/react';
import ReactPlayerLoader from '../src/index.js';
import BrightcovePlayerLoader from '@brightcove/player-loader';

QUnit.module('ReactPlayerLoader', {
  beforeEach() {
    this.fixture = document.getElementById('qunit-fixture');
    this.originalBaseUrl = BrightcovePlayerLoader.getBaseUrl();
    BrightcovePlayerLoader.setBaseUrl(`${window.location.origin}/vendor/`);
  },
  afterEach() {
    cleanup();

    // reset the base url and global state
    BrightcovePlayerLoader.setBaseUrl(this.originalBaseUrl);
    BrightcovePlayerLoader.reset();

    // unmount all components on the fixture
    ReactDOM.unmountComponentAtNode(this.fixture);
  }
}, function() {

  QUnit.module('baseline usage');

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

  QUnit.module('attrs');

  QUnit.test('can set attributes on the component element', function(assert) {
    const done = assert.async();

    assert.expect(1);

    ReactDOM.render(
      React.createElement(ReactPlayerLoader, {
        accountId: '1',
        attrs: {foo: 'bar'},
        onSuccess: ({ref, type}) => {
          window.setTimeout(done, 1);
        }
      }),
      this.fixture
    );

    assert.ok(this.fixture.querySelector('div[foo="bar"]'), 'foo="bar" div exists');
  });

  QUnit.test('can set attributes on the embed element', function(assert) {
    const done = assert.async();

    assert.expect(1);

    ReactDOM.render(
      React.createElement(ReactPlayerLoader, {
        accountId: '1',
        onSuccess: ({ref, type}) => {
          window.setTimeout(done, 1);
        },
        onEmbedCreated: (element) => {
          element.setAttribute('data-attribute', '1');
        }
      }),
      this.fixture
    );

    assert.ok(this.fixture.querySelector('video-js[data-attribute="1"]'), 'found data attribute');
  });

  QUnit.test('className defaults to "brightcove-react-player-loader"', function(assert) {
    const done = assert.async();

    assert.expect(1);

    ReactDOM.render(
      React.createElement(ReactPlayerLoader, {
        accountId: '1',
        attrs: {id: 'test'},
        onSuccess: ({ref, type}) => {
          window.setTimeout(done, 1);
        }
      }),
      this.fixture
    );

    const el = this.fixture.querySelector('#test');

    assert.strictEqual(el.className, 'brightcove-react-player-loader', 'component element has correct className');
  });

  QUnit.test('className can be set to override default', function(assert) {
    const done = assert.async();

    assert.expect(1);

    ReactDOM.render(
      React.createElement(ReactPlayerLoader, {
        accountId: '1',
        attrs: {
          className: 'foo bar',
          id: 'test'
        },
        onSuccess: ({ref, type}) => {
          window.setTimeout(done, 1);
        }
      }),
      this.fixture
    );

    const el = this.fixture.querySelector('#test');

    assert.strictEqual(el.className, 'foo bar', 'component element has correct className');
  });

  QUnit.module('props', {
    beforeEach() {

      // This mock catalog plugin takes custom options for testing purposes.
      // The ReactPlayerLoader expects that the player will have initialized
      // the Video Cloud Catalog plugin itself.
      //
      // The custom options for the mock plugin instruct it whether or not to
      // produce "error" cases.
      this.mockCatalogPlugin = function(options = {}) {
        const err = new Error('mock catalog request failure');

        this.catalog = {
          getLazySequence(seq, cb, adConfigId) {
            if (options.error) {
              cb(err, null);
            } else {
              cb(null, options.data || [{foo: 1}]);
            }
          },
          get(params, cb) {
            let result = {foo: 1};

            if (params.type === 'playlist' || params.type === 'search') {
              result = [result, {foo: 2}];
            }

            if (options.error) {
              cb(err, null);
            } else {
              cb(null, options.data || result);
            }
          },
          load(data) {
            return data;
          }
        };

        Object.keys(this.catalog).forEach(key => sinon.spy(this.catalog, key));
      };

      this.mockPlaylistPlugin = function(list = [], currentItem = 0) {
        this.playlist = (l, i) => {
          if (l !== undefined) {
            list = l;
            if (i > -1) {
              currentItem = i;
            }
          }
          return list;
        };

        this.playlist.currentItem = (i) => {
          if (i !== undefined) {
            currentItem = i;
          }
          return currentItem;
        };

        sinon.spy(this.playlist, 'currentItem');
      };
    },
    afterEach() {
      this.mockCatalogPlugin = null;
      this.mockPlaylistPlugin = null;
    }
  });

  QUnit.test('change catalogSearch, success response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      adConfigId: 'abc-123',
      deliveryConfigId: 'def-456',
      catalogSearch: '2',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog();

        props.catalogSearch = '3';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.calledOnce, 'player.catalog.load was called');

        const params = ref.catalog.get.getCall(0).args[0];

        assert.deepEqual(params, {
          adConfigId: 'abc-123',
          deliveryConfigId: 'def-456',
          q: '3',
          type: 'search'
        }, 'catalog params were correct');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change catalogSearch, failure response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      catalogSearch: '2',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog({error: true});

        props.catalogSearch = '3';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.notCalled, 'player.catalog.load was not called');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change catalogSequence, success response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      adConfigId: 'abc-123',
      deliveryConfigId: 'def-456',
      catalogSequence: [{}],
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog();

        props.catalogSequence = [{}, {}];

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.notCalled, 'player.catalog.get was not called');
        assert.ok(ref.catalog.getLazySequence.calledOnce, 'player.catalog.getLazySequence was called');
        assert.ok(ref.catalog.load.calledOnce, 'player.catalog.load was called');

        const seq = ref.catalog.getLazySequence.getCall(0).args[0];

        assert.deepEqual(seq, props.catalogSequence, 'catalog sequence was correct');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change catalogSequence, failure response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      catalogSequence: [{}],
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog({error: true});

        props.catalogSequence = [{}, {}];

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.notCalled, 'player.catalog.get was not called');
        assert.ok(ref.catalog.getLazySequence.calledOnce, 'player.catalog.getLazySequence was called');
        assert.ok(ref.catalog.load.notCalled, 'player.catalog.load was not called');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change playlistId, success response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      adConfigId: 'abc-123',
      deliveryConfigId: 'def-456',
      playlistId: '2',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog();

        props.playlistId = '3';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.calledOnce, 'player.catalog.load was called');

        const params = ref.catalog.get.getCall(0).args[0];

        assert.deepEqual(params, {
          adConfigId: 'abc-123',
          deliveryConfigId: 'def-456',
          id: '3',
          type: 'playlist'
        }, 'catalog params were correct');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change playlistId, failure response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      playlistId: '2',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog({error: true});

        props.playlistId = '3';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.notCalled, 'player.catalog.load was not called');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change videoId, success response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      adConfigId: 'abc-123',
      deliveryConfigId: 'def-456',
      videoId: '2',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog();

        props.videoId = '3';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.calledOnce, 'player.catalog.load was called');

        const params = ref.catalog.get.getCall(0).args[0];

        assert.deepEqual(params, {
          adConfigId: 'abc-123',
          deliveryConfigId: 'def-456',
          id: '3',
          type: 'video'
        }, 'catalog params were correct');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change videoId, failure response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      videoId: '2',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog({error: true});

        props.videoId = '3';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.notCalled, 'player.catalog.load was not called');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('change from one catalog request type to another ignores previous props', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      adConfigId: 'abc-123',
      deliveryConfigId: 'def-456',
      catalogSearch: '0',
      catalogSequence: '1',
      playlistId: '2',
      videoId: '3',
      onSuccess: ({ref, type}) => {
        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog();

        props.playlistId = '4';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.calledOnce, 'player.catalog.load was called');

        const params = ref.catalog.get.getCall(0).args[0];

        assert.deepEqual(params, {
          adConfigId: 'abc-123',
          deliveryConfigId: 'def-456',
          id: '4',
          type: 'playlist'
        }, 'props that trigger a type of catalog request and were not changed were not included');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('changing playlistId + playlistVideoId, success response', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      embedOptions: {unminified: true},
      playlistId: '0',
      playlistVideoId: '0',
      onSuccess: ({ref, type}) => {
        const playlist = [{
          id: 1
        }, {
          id: 2
        }];

        window.videojs.registerPlugin('catalog', this.mockCatalogPlugin);
        ref.catalog({data: playlist});

        props.playlistId = '1';
        props.playlistVideoId = 2;

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.ok(ref.catalog.get.calledOnce, 'player.catalog.get was called');
        assert.ok(ref.catalog.load.calledOnce, 'player.catalog.load was called');

        const params = ref.catalog.get.getCall(0).args[0];

        assert.deepEqual(params, {
          id: '1',
          type: 'playlist'
        }, 'catalog params were correct');

        // The test players have the playlist plugin, but we want a minimal
        // test case for playlists; so, we remove it and mock a new plugin.
        window.videojs.getPlugin('plugin').deregisterPlugin('playlist');
        delete ref.playlist;

        window.videojs.registerPlugin('playlist', this.mockPlaylistPlugin);
        ref.playlist(playlist, playlist.startingIndex);

        assert.strictEqual(ref.playlist.currentItem(), 1, 'the second playlist item is selected');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('changing playlistVideoId on an already loaded playlist, using referenceId instead of id', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      playlistId: '0',
      playlistVideoId: '0',
      onSuccess: ({ref, type}) => {

        // The test players have the playlist plugin, but we want a minimal
        // test case for playlists; so, we remove it and mock a new plugin.
        window.videojs.getPlugin('plugin').deregisterPlugin('playlist');
        delete ref.playlist;

        window.videojs.registerPlugin('playlist', this.mockPlaylistPlugin);
        ref.playlist([{
          id: 1
        }, {
          id: 2
        }, {
          id: 3,
          referenceId: 'foo'
        }]);

        props.playlistVideoId = 'ref:foo';

        rerender(React.createElement(ReactPlayerLoader, props));

        assert.strictEqual(ref.playlist.currentItem(), 2, 'the third playlist item is selected');

        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('other prop changes reload the player', function(assert) {
    const done = assert.async();

    let rerender;

    const props = {
      accountId: '1',
      applicationId: 'foo',
      onSuccess: ({ref, type}) => {
        if (props.applicationId === 'bar') {
          assert.ok(true, 'the success callback was called a second time because the player was re-loaded');
          done();
        }

        props.applicationId = 'bar';
        rerender(React.createElement(ReactPlayerLoader, props));
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('loadPlayer() method reloads player', function(assert) {
    const done = assert.async(2);

    const props = {
      accountId: '1',
      applicationId: 'foo',
      onSuccess: ({ref, type}) => {
        assert.ok(true, 'the success callback was called');
        done();
      }
    };

    const reactPlayerLoader = ReactDOM.render(
      React.createElement(ReactPlayerLoader, props),
      this.fixture
    );

    reactPlayerLoader.loadPlayer();
  });

  QUnit.test('set manualReloadFromPropChanges to true', function(assert) {
    const done = assert.async(2);
    let rerender;
    const props = {
      accountId: '1',
      applicationId: 'foo',
      manualReloadFromPropChanges: true,
      onSuccess: ({ref, type}) => {
        if (props.applicationId !== 'bar') {
          props.applicationId = 'bar';
          done();
        }
        rerender(React.createElement(ReactPlayerLoader, props));
        assert.ok(true, 'the success callback was called');
        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });

  QUnit.test('set manualReloadFromPropChanges to false', function(assert) {
    const done = assert.async(3);
    let rerender;
    const props = {
      accountId: '1',
      applicationId: 'foo',
      manualReloadFromPropChanges: false,
      onSuccess: ({ref, type}) => {
        if (props.applicationId !== 'bar') {
          props.applicationId = 'bar';
          done();
        }
        rerender(React.createElement(ReactPlayerLoader, props));
        assert.ok(true, 'the success callback was called');
        done();
      }
    };

    rerender = render(React.createElement(ReactPlayerLoader, props)).rerender;
  });
});
