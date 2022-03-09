import { useEffect, useState } from "react";
import playerLoader from "@brightcove/player-loader";

/**
 * These prop changes can be handled by an internal player state change rather
 * than a full dispose/recreate.
 *
 * @private
 * @type {Object}
 */
const UPDATEABLE_PROPS = [
  "catalogSearch",
  "catalogSequence",
  "playlistId",
  "playlistVideoId",
  "videoId",
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
export default ReactPlayerLoader = ({
  baseUrl,
  attrs,
  manualReloadFromPropChanges,
  catalogSearch,
  catalogSequence,
  onSuccess,
  onFailure,
  playlistId,
  playlistVideoId,
  videoId,
}) => {
  const [refNode, setRefNode] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Loads a new player based on the current props.
   */
  const loadPlayer = () => {
    // If there is any player currently loaded, dispose it before fetching a
    // new one.
    disposePlayer();

    // We need to provide our own callbacks below, so we cache these
    // user-provided callbacks for use later.
    const userSuccess = onSuccess;
    const userFailure = onFailure;

    const options = Object.assign({}, props, {
      refNode: refNode,
      refNodeInsert: "append",
      onSuccess: ({ ref, type }) => {
        // If the component is not mounted when the callback fires, dispose
        // the player and bail out.
        if (!isMounted) {
          disposePlayer(ref);
          return;
        }

        // Store a player reference on the component.
        player = ref;

        // Null out the player reference when the player is disposed from
        // outside the component.
        if (type === "in-page") {
          ref.one("dispose", () => {
            this.player = null;
          });
        }

        // Add a REACT_PLAYER_LOADER property to bcinfo to indicate this player
        // was loaded via that mechanism.
        if (ref.bcinfo) {
          ref.bcinfo.REACT_PLAYER_LOADER = true;
        }

        // Call a user-provided onSuccess callback.
        if (typeof userSuccess === "function") {
          userSuccess({ ref, type });
        }
      },
      onFailure: (error) => {
        // Ignore errors when not mounted.
        if (!isMounted) {
          return;
        }

        // Call a user-provided onFailure callback.
        if (typeof userFailure === "function") {
          userFailure(error);
          return;
        }

        // Fall back to throwing an error;
        throw new Error(error);
      },
    });

    // Delete props that are not meant to be passed to player-loader.
    delete options.attrs;
    delete options.baseUrl;
    delete options.manualReloadFromPropChanges;

    // If a base URL is provided, it should only apply to this player load.
    // This means we need to back up the original base URL and restore it
    // _after_ we call player loader.
    const originalBaseUrl = playerLoader.getBaseUrl();

    if (baseUrl) {
      playerLoader.setBaseUrl(baseUrl);
    }

    playerLoader(options);
    playerLoader.setBaseUrl(originalBaseUrl);
  };

  /**
   * Disposes the current player, if there is one.
   */
  const disposePlayer = () => {
    // Nothing to dispose.
    if (!player) {
      return;
    }

    // Dispose an in-page player.
    if (player.dispose) {
      player.dispose();

      // Dispose an iframe player.
    } else if (player.parentNode) {
      player.parentNode.removeChild(player);
    }

    // Null out the player reference.
    player = null;
  };

  /**
   * Find the index of the `playlistVideoId` prop within the player's playlist.
   *
   * @param  {Object[]} playlist
   *         An array of playlist item objects.
   *
   * @return {number}
   *         The index of the `playlistVideoId` or `-1` if the player has been
   *         disposed, is not using the playlist plugin, or if not found.
   */
  const findPlaylistVideoIdIndex_ = (playlist) => {
    if (Array.isArray(playlist) && playlistVideoId) {
      for (let i = 0; i < playlist.length; i++) {
        const { id, referenceId } = playlist[i];

        if (
          id === playlistVideoId ||
          `ref:${referenceId}` === playlistVideoId
        ) {
          return i;
        }
      }
    }
    return -1;
  };

  /**
   * Create a Playback API callback function for the component's player.
   *
   * @private
   * @param  {string} requestType
   *         The Playback API request type (e.g. "video" or "playlist").
   *
   * @param  {Object} changes
   *         An object. The keys of this object are the props that changed.
   *
   * @return {Function}
   *         A callback for the Playback API request.
   */
  const createPlaybackAPICallback_ = (requestType, changes) => {
    return (err, data) => {
      if (err) {
        logError(err);
        return;
      }

      // If the playlistVideoId changed and this is a playlist request, we
      // need to search through the playlist items to find the correct
      // starting index.
      if (requestType === "playlist" && changes.playlistVideoId) {
        const i = findPlaylistVideoIdIndex_(data);

        if (i > -1) {
          data.startingIndex = i;
        }
      }

      player.catalog.load(data);
    };
  };

  /**
   * Update the player based on changes to certain props that do not require
   * a full player dispose/recreate.
   *
   * @param {Object} changes
   *        An object. The keys of this object are the props that changed.
   */
  const updatePlayer = (changes) => {
    // No player exists, player is disposed, or not using the catalog
    if (!player || !player.el()) {
      return;
    }

    // If the player is using the catalog plugin, we _may_ populate this
    // variable with an object.
    let catalogParams;

    if (player.usingPlugin("catalog")) {
      // There is a new catalog sequence request. This takes precedence over
      // other catalog updates because it is a different call.
      if (changes.catalogSequence && catalogSequence) {
        const callback = createPlaybackAPICallback_("sequence", changes);

        player.catalog.getLazySequence(catalogSequence, callback, adConfigId);
        return;
      }

      if (changes.videoId && videoId) {
        catalogParams = {
          type: "video",
          id: videoId,
        };
      } else if (changes.playlistId && playlistId) {
        catalogParams = {
          type: "playlist",
          id: playlistId,
        };
      } else if (changes.catalogSearch && catalogSearch) {
        catalogParams = {
          type: "search",
          q: catalogSearch,
        };
      }
    }

    // If `catalogParams` is `undefined` here, that means the player either
    // does not have the catalog plugin or no valid catalog request can be made.
    if (catalogParams) {
      if (adConfigId) {
        catalogParams.adConfigId = adConfigId;
      }

      if (deliveryConfigId) {
        catalogParams.deliveryConfigId = deliveryConfigId;
      }

      // We use the callback style here to make tests simpler in IE11 (no need
      // for a Promise polyfill).
      const callback = createPlaybackAPICallback_(catalogParams.type, changes);

      this.player.catalog.get(catalogParams, callback);

      // If no catalog request is being made, we may still need to update the
      // playlist selected video.
    } else if (
      changes.playlistVideoId &&
      playlistVideoId &&
      this.player.usingPlugin("playlist")
    ) {
      const i = findPlaylistVideoIdIndex_(this.player.playlist());

      if (i > -1) {
        this.player.playlist.currentItem(i);
      }
    }
  };

  /**
   * Called just after the component has mounted.
   */
  useEffect(() => {
    setIsMounted(true);
    loadPlayer();
  }, []);

  /**
   * Called when the component props are updated.
   *
   * Some prop changes may trigger special behavior (see `propChangeHandlers`),
   * but if ANY prop is changed that is NOT handled, the player will be
   * disposed/recreated entirely.
   *
   * @param  {Object} prevProps
   *         The previous props state before change.
   */
  useEffect(() => {
    if (!manualReloadFromPropChanges) {
      // Dispose and recreate the player if any changed keys cannot be handled.
      if (
        Object.keys(changes).some((k) => UPDATEABLE_PROPS.indexOf(k) === -1)
      ) {
        loadPlayer();
        return;
      }
    }

    updatePlayer(changes);
  }, []);

  /**
   * Called just before a component unmounts. Disposes the player.
   */
  useEffect(() => {
    setIsMounted(false);
    disposePlayer();
  }, []);

  const props = Object.assign(
    { className: "brightcove-react-player-loader" },
    attrs,
    { ref: setRefNode }
  );

  /**
   * Renders the component.
   *
   * @return {ReactElement}
   *          The react element to render.
   */
  return React.createElement("div", props);
};
