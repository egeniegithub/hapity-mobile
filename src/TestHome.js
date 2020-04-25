import React from "react";
import { View, Text, Button } from "react-native";
import { getLoginSL, removeLoginUser } from "./Storage/StorageLocal";
import { StackActions, NavigationActions } from "react-navigation";

export default class TestHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ""
    };
  }

  componentDidMount() {
    getLoginSL().then(res => {
      this.setState({ username: res.user_info.username });
    });
  }
  getData = () => {
    getLoginSL().then(res => {});
  };

  logoutUser = () => {
    removeLoginUser().then(() => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "Splash" })]
      });
      this.props.navigation.dispatch(resetAction);
    });
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>
          Welcome {this.state.username}
        </Text>

        <View style={{ marginTop: 20 }}>
          <Button title="Log Out " onPress={this.logoutUser} />
        </View>
      </View>
    );
  }
}
