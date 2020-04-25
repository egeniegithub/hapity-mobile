import React from "react";
import { View, Text } from "react-native";
import * as colors from "../Theme/Color";

export default class StartBroadcastCountDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      countDown: 5
    };
  }

  componentDidMount() {
    this.countDownInterval = setInterval(() => {
      this.setState({ countDown: this.state.countDown - 1 });
    }, 1000);
  }

  componentDidUpdate() {
    if (this.state.countDown === 0) {
      this.props.startBroacastOnLaunch(true);
      clearInterval(this.countDownInterval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.countDownInterval);
  }

  render() {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            color: colors.colorWhite,
            marginTop: 20
          }}
        >
          Starting Broadcast in
        </Text>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 25,
            color: colors.colorWhite,
            marginTop: 5
          }}
        >
          {this.state.countDown}
        </Text>
      </View>
    );
  }
}
