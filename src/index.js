import React from 'react';
import playerLoader from '@brightcove/player-loader';

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
   *        options that are listed, and `refNode`/`refNodeInsert`
   *        which will be ignored, as they are used internally to
   *        get this component to work.
   */
  constructor(props) {
    super(props);
    this.state = {};
    this.refNode = React.createRef();
  }

  /**
   * Called just after the component has mounted on
   * the DOM. Will only be called in the web browser.
   */
  componentDidMount() {
    const userSuccess = this.props.onSuccess;
    const userFailure = this.props.onFailure;

    const options = Object.assign({}, this.props, {
      refNode: this.refNode.current,
      refNodeInsert: 'append',
      onSuccess: ({ref, type}) => {
        this.setState({player: ref});
        if (userSuccess) {
          userSuccess({ref, type});
        }
      },
      onFailure: (error) => {
        if (userFailure) {
          return userFailure(error);
        }
        throw new Error(error);
      }
    });

    playerLoader(options);
  }

  /**
   * Called when a component unmounts from the DOM.
   * Cleans up the player.
   */
  componentWillUnmount() {
    if (!this.state.player) {
      return;
    }

    // cleanup in-page
    if (this.state.player.dispose) {
      this.state.player.dispose();
    }

    // cleanup iframe
    if (this.state.player.parentNode) {
      this.state.player.parentNode.removeChild(this.player);
    }

    this.state.player = null;
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
