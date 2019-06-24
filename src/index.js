import React from 'react';
import playerLoader from '@brightcove/player-loader';

/**
 * These prop changes can be handled by an internal player state change rather
 * than a full reload.
 *
 * @private
 * @type {Object}
 */
const UPDATEABLE_PROPS = [
  'catalogSearch',
  'catalogSequence',
  'playlistId',
  'playlistVideoId',
  'videoId'
];

const logError = (err) => {
  /* eslint-disable no-console */
  if (err && console && console.error) {
    console.error(err);
  }
  /* eslint-enable no-console */
};

/**
 * The official React component for the Brightcove Player!
 *
 * This uses `@brightcove/player-loader` to load a player into a React
 * component based on the given props.
 */
class ReactPlayerLoader extends React.Component {

  /**
   * Create a new Brightcove player.
   *
   * @param {Object} props
   *        Most options will be passed along to player-loader, except for
   *        options that are listed. See README.md for more detail.
   *
   * @param {string} [props.baseUrl]
   *        The base URL to use when requesting a player
   *
   * @param {Object} [props.attrs]
   *        Used to set attributes on the component element that contains the
   *        embedded Brightcove Player.
   */
  constructor(props) {
    super(props);
    this.refNode = null;
    this.setRefNode = ref => {
      this.refNode = ref;
    };
  }

  /**
   * Loads a new player based on the current props.
   */
  loadPlayer() {

    // If there is any player currently loaded, dispose it before fetching a
    // new one.
    this.disposePlayer();

    // We need to provide our own callbacks below, so we cache these
    // user-provided callbacks for use later.
    const userSuccess = this.props.onSuccess;
    const userFailure = this.props.onFailure;

    const options = Object.assign({}, this.props, {
      refNode: this.refNode,
      refNodeInsert: 'append',
      onSuccess: ({ref, type}) => {

        // If the component is not mounted when the callback fires, dispose
        // the player and bail out.
        if (!this.isMounted_) {
          this.disposePlayer(ref);
          return;
        }

        // Store a player reference on the component.
        this.player = ref;

        // Null out the player reference when the player is disposed from
        // outside the component.
        ref.on('dispose', () => {
          this.player = null;
        });

        // Add a REACT_PLAYER_LOADER property to bcinfo to indicate this player
        // was loaded via that mechanism.
        if (ref.bcinfo) {
          ref.bcinfo.REACT_PLAYER_LOADER = true;
        }

        // Call a user-provided onSuccess callback.
        if (typeof userSuccess === 'function') {
          userSuccess({ref, type});
        }
      },
      onFailure: (error) => {

        // Ignore errors when not mounted.
        if (!this.isMounted_) {
          return;
        }

        // Call a user-provided onFailure callback.
        if (typeof userFailure === 'function') {
          userFailure(error);
          return;
        }

        // Fall back to throwing an error;
        throw new Error(error);
      }
    });

    // Delete props that are not meant to be passed to player-loader.
    delete options.attrs;
    delete options.baseUrl;

    // If a base URL is provided, it should only apply to this player load.
    // This means we need to back up the original base URL and restore it
    // _after_ we call player loader.
    const originalBaseUrl = playerLoader.getBaseUrl();

    if (this.props.baseUrl) {
      playerLoader.setBaseUrl(this.props.baseUrl);
    }

    playerLoader(options);
    playerLoader.setBaseUrl(originalBaseUrl);
  }

  /**
   * Disposes the current player, if there is one.
   */
  disposePlayer() {

    // Nothing to dispose.
    if (!this.player) {
      return;
    }

    // Dispose an in-page player.
    if (this.player.dispose) {
      this.player.dispose();

    // Dispose an iframe player.
    } else if (this.player.parentNode) {
      this.player.parentNode.removeChild(this.player);
    }

    // Null out the player reference.
    this.player = null;
  }

  /**
   * Update the player based on changes to certain props that do not require
   * a full player reload.
   *
   * @param {Object} changes
   *        An object. The keys of this object are the props that changed.
   */
  updatePlayer(changes) {

    // No player exists or player is disposed.
    if (!this.player || !this.player.el()) {
      return;
    }

    const findPlaylistItemIndex = (items) => {
      if (Array.isArray(items) && this.props.playlistVideoId) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (
            item.id === this.props.playlistVideoId ||
            `ref:${item.referenceId}` === this.props.playlistVideoId
          ) {
            return i;
          }
        }
      }
      return -1;
    };

    const catalogCallback = (requestType) => {
      return (err, data) => {
        if (err) {
          logError(err);
          return;
        }

        // If the playlistVideoId changed and this is a playlist request, we
        // need to search through the playlist items to find the correct
        // starting index.
        if (requestType === 'playlist' && changes.playlistVideoId) {
          const i = findPlaylistItemIndex(data);

          if (i > -1) {
            data.startingIndex = i;
          }
        }

        this.player.catalog.load(data);
      };
    };

    let catalogParams;

    if (this.player.usingPlugin('catalog')) {

      // There is a new catalog sequence request. This takes precedence over
      // other catalog updates because it is a different call.
      if (changes.catalogSequence && this.props.catalogSequence) {
        this.player.catalog.getLazySequence(this.props.catalogSequence, catalogCallback('sequence'), this.props.adConfigId);
        return;
      }

      if (changes.videoId && this.props.videoId) {
        catalogParams = {
          type: 'video',
          id: this.props.videoId
        };
      } else if (changes.playlistId && this.props.playlistId) {
        catalogParams = {
          type: 'playlist',
          id: this.props.playlistId
        };
      } else if (changes.catalogSearch && this.props.catalogSearch) {
        catalogParams = {
          type: 'search',
          q: this.props.catalogSearch
        };
      }
    }

    if (catalogParams) {
      if (this.props.adConfigId) {
        catalogParams.adConfigId = this.props.adConfigId;
      }

      if (this.props.deliveryConfigId) {
        catalogParams.deliveryConfigId = this.props.deliveryConfigId;
      }

      // We use the callback style here to make tests simpler in IE11 (no need
      // for a Promise polyfill).
      this.player.catalog.get(catalogParams, catalogCallback(catalogParams.type));
    } else if (
      changes.playlistVideoId &&
      this.props.playlistVideoId &&
      this.player.usingPlugin('playlist')
    ) {
      const i = findPlaylistItemIndex(this.player.playlist());

      if (i > -1) {
        this.player.playlist.currentItem(i);
      }
    }
  }

  /**
   * Called just after the component has mounted.
   */
  componentDidMount() {
    this.isMounted_ = true;
    this.loadPlayer();
  }

  /**
   * Called when the component props are updated.
   *
   * Some prop changes may trigger special behavior (see `propChangeHandlers`),
   * but if ANY prop is changed that is NOT handled, the player will be
   * reloaded entirely.
   *
   * @param  {Object} prevProps
   *         The previous props state before change.
   */
  componentDidUpdate(prevProps) {

    // Calculate the prop changes.
    const changes = Object.keys(prevProps).reduce((acc, key) => {
      const previous = prevProps[key];
      const current = this.props[key];

      if (current !== previous) {
        acc[key] = true;
      }

      return acc;
    }, {});

    // If any changed keys cannot be handled without a reload, perform a reload.
    if (Object.keys(changes).some(k => UPDATEABLE_PROPS.indexOf(k) === -1)) {
      this.loadPlayer();
      return;
    }

    this.updatePlayer(changes);
  }

  /**
   * Called just before a component unmounts. Disposes the player.
   */
  componentWillUnmount() {
    this.isMounted_ = false;
    this.disposePlayer();
  }

  /**
   * Renders the component.
   *
   * @return {ReactElement}
   *          The react element to render.
   */
  render() {
    const props = Object.assign(
      {className: 'brightcove-react-player-loader'},
      this.props.attrs,
      {ref: this.setRefNode}
    );

    return React.createElement('div', props);
  }
}

export default ReactPlayerLoader;
