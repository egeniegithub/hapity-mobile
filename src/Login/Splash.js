import React from "react";
import { StyleSheet, View, Image, StatusBar } from "react-native";
import {
  getIsFirstInstall,
  getLoginSL,
  getAutoBroadcast
} from "../Storage/StorageLocal";
import { StackActions, NavigationActions } from "react-navigation";

let colors = require("../Theme/Color");

export default class Splash extends React.Component {
  componentDidMount() {
    setTimeout(() => {
      getIsFirstInstall().then(res => {
        if (res !== null) {
          // is User login or not
          getLoginSL().then(res => {
            if (res !== null) {
              // user Log In
              getAutoBroadcast().then(res => {
                if (JSON.parse(res)) {
                  const resetAction = StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({ routeName: "LiveStreaming" })
                    ]
                  });
                  this.props.navigation.dispatch(resetAction);
                } else {
                  const resetAction = StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({ routeName: "History" })
                    ]
                  });
                  this.props.navigation.dispatch(resetAction);
                }
              });
            } else {
              // user not login
              const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "Login" })]
              });
              this.props.navigation.dispatch(resetAction);
            }
          });
        } else {
          // As for First time install
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "ShareStory" })]
          });
          this.props.navigation.dispatch(resetAction);
        }
      });
    }, 1000);
  }

  render() {
    // setTimeout(() => {
    //     this.props.navigation.navigate("ShareStory");
    // }, 1000);
    return (
      <View style={styles.mainContainer}>
        <StatusBar hidden />
        <Image
          style={{ width: 200, height: 70 }}
          source={require("../../assets/hapityText.png")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colorPrimary,
    justifyContent: "center",
    alignItems: "center"
  }
});
