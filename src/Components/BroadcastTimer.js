import React from "react";
import { View, Text } from "react-native";
import * as colors from "../Theme/Color";

export default class BroadcastTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: "0:00:00"
    };
  }

  componentDidMount() {
    this.broadcastTime();
  }

  broadcastTime = () => {
    let sec = 0;
    let mint = 0;
    let hour = 0;
    let time = 0;
    let totalTime = 0;
    this.broadcastTimer = setInterval(() => {
      time = time + 1;
      sec = time % 60;
      if (sec < 10) {
        sec = `0${sec}`;
      }
      mint = Math.floor((time / 60) % 60);
      if (mint < 10) {
        mint = `0${mint}`;
      }
      hour = Math.floor(time / 3600);
      totalTime = `${hour}:${mint}:${sec}`;
      this.setState({ timer: totalTime });
    }, 1000);
  };

  componentWillUnmount() {
    clearInterval(this.broadcastTimer);
  }

  render() {
    return (
      <View>
        <Text
          style={{
            color: colors.colorWhite,
            fontWeight: "bold",
            marginTop: 10
          }}
        >
          {this.state.timer}
        </Text>
      </View>
    );
  }
}
