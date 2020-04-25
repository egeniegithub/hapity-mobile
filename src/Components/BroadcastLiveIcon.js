import React from "react";
import { View, Image, Text } from "react-native";

import * as colors from "../Theme/Color";

export default class BroadcastLiveIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blinkTimer: true
    };
  }

  componentDidMount() {
    this.myInterval = setInterval(() => {
      this.setState({
        blinkTimer: !this.state.blinkTimer
      });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }

  render() {
    return (
      <View style={{ position: "absolute", bottom: 80, left: 10 }}>
        {this.state.blinkTimer ? (
          // <View style={{ position: "absolute", bottom: 80, left: 10 }}>
          <View>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/player_record.png")}
            />
            <Text
              style={{
                color: colors.colorWhite,
                fontWeight: "bold",
                marginTop: 4
              }}
            >
              YOU ARE LIVE NOW
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
}
