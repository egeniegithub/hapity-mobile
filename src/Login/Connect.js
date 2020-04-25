import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity
} from "react-native";
import { Icon } from "react-native-elements";
import { StackActions, NavigationActions } from "react-navigation";
import { setIsFirstInstall } from "../Storage/StorageLocal";

let colors = require("../Theme/Color");

export default class Connect extends React.Component {
  goToLoginScreen = () => {
    setIsFirstInstall("false").then(() => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "Login" })]
      });
      this.props.navigation.dispatch(resetAction);
    });
  };
  render() {
    return (
      <View style={styles.mainContainer}>
        <StatusBar hidden />
        <Text
          style={{
            marginTop: 130,
            fontSize: 20,
            color: colors.colorPrimary,
            fontWeight: "bold"
          }}
        >
          CONNECT
        </Text>
        <Text style={styles.textStyle}>
          Connect with the world in a different way
        </Text>

        <View style={{ marginTop: 80 }}>
          <Image
            style={{ width: 230, height: 100 }}
            source={require("../../assets/connect_intro.png")}
          />
        </View>

        <View
          style={{ height: 50, width: "100%", position: "absolute", bottom: 0 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: colors.colorBlack,
                borderRadius: 4
              }}
            ></View>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: colors.colorWhite,
                borderRadius: 4,
                marginLeft: 4,
                borderWidth: 0.5
              }}
            ></View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forwardArrowStyle}
          onPress={this.goToLoginScreen}
        >
          <Icon name="check" color={colors.colorWhite} size={30} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colorWhite,
    alignItems: "center"
  },
  imageContainer: {
    height: 100,
    marginTop: 70
  },
  textStyle: {
    color: colors.colorPrimary,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 30
  },
  forwardArrowStyle: {
    width: 50,
    height: 50,
    backgroundColor: colors.colorDarkGray,
    borderRadius: 25,
    position: "absolute",
    bottom: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center"
  }
});
