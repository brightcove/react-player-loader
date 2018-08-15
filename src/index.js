import React from 'react';
import playerLoader from '@brightcove/player-loader';

/**
 * dispose an iframe or in-page player
 *
 * @param {Object|Element} player
 *        The iframe element for the player or
 *        the player instance.
 */
const disposePlayer = function(player) {

  // cleanup in-page
  if (player.dispose) {
    player.dispose();
  }

  // cleanup iframe
  if (player.parentNode) {
    player.parentNode.removeChild(player);
  }

};

/**
 * The official React component for the Brightcove
 * Player! This uses `@brightcove/player-loader` to load
 * a player into a React component based on the given props.
 */
class ReactBrightcovePlayer extends React.Component {

  /**
   * Create a new Brightcove player.
   *
   * @param {Object} props
   *        Most options will be passed along to player-loader, except for
   *        options that are listed. The exception is `refNode`/`refNodeInsert`
   *        which will be ignored, as they are used internally to
   *        get this component to work.
   *
   * @param {string} props.baseUrl
   *        The baseUrl to use when requesting a player
   */
  constructor(props) {
    super(props);
    this.refNode = React.createRef();
  }

  /**
   * Called just after the component has mounted on
   * the DOM (right after `render()`).Will only be
   * called in the web browser.
   */
  componentDidMount() {
    this.mounted_ = true;
    // we have to make a copy of onSuccess and
    // onFailure here, because we have to pass
    // our own callbacks to player-loader
    // to determine success/failure.
    const userSuccess = this.props.onSuccess;
    const userFailure = this.props.onFailure;

    const options = Object.assign({}, this.props, {
      refNode: this.refNode.current,
      refNodeInsert: 'append',
      onSuccess: ({ref, type}) => {
        // ignore success when not mounted
        // and dispose the player
        if (!this.mounted_) {
          disposePlayer(ref);
          return;
        }
        this.player = ref;
        if (userSuccess) {
          userSuccess({ref, type});
        }
      },
      onFailure: (error) => {
        // ignore errors when not mounted
        if (!this.mounted_) {
          return;
        }
        if (userFailure) {
          return userFailure(error);
        }
        throw new Error(error);
      }
    });

    const originalBaseUrl = playerLoader.getBaseUrl();

    if (this.props.baseUrl) {
      playerLoader.setBaseUrl(this.props.baseUrl);
    }

    playerLoader(options);

    playerLoader.setBaseUrl(originalBaseUrl);
  }

  /**
   * Called just before a component unmounts from the DOM.
   * Cleans up the player.
   */
  componentWillUnmount() {
    if (!this.mounted_) {
      return;
    }

    this.mounted_ = false;

    if (!this.player) {
      return;
    }

    disposePlayer(this.player);
    this.player = null;
  }

  /**
   * Renders the player
   *
   * @return {ReactElement}
   *          The react element to render
   */
  render() {
    return React.createElement('div', {ref: this.refNode});
  }

}

export default ReactBrightcovePlayer;
