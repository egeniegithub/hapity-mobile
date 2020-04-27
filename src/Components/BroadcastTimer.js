import React from "react";

export default class BroadcastTimer extends React.Component {

  componentDidMount() {
    this.broadcastTimer = setInterval(() => {
      this.props.enBroadcast()
      clearInterval(this.broadcastTimer);
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.broadcastTimer);
  }

  render() {
    return null;
  }
}
