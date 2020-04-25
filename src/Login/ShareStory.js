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

let colors = require("../Theme/Color");

export default class ShareStory extends React.Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <StatusBar hidden />
        <View style={styles.imageContainer}>
          <Image
            style={{ width: 200, height: 70 }}
            source={require("../../assets/hapityText.png")}
          />
        </View>
        <Text style={styles.textStyle}>share your story with Hapity</Text>

        <View style={{ marginTop: 60 }}>
          <Image
            style={{ width: 200, height: 150 }}
            source={require("../../assets/share_screen_intro.png")}
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
                backgroundColor: colors.colorWhite,
                borderRadius: 4,
                borderWidth: 0.5
              }}
            ></View>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: colors.colorBlack,
                borderRadius: 4,
                marginLeft: 4
              }}
            ></View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forwardArrowStyle}
          onPress={() => this.props.navigation.navigate("Connect")}
        >
          <Icon name="arrow-forward" color={colors.colorWhite} size={30} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colorPrimary,
    alignItems: "center"
  },
  imageContainer: {
    height: 100,
    marginTop: 70
  },
  textStyle: {
    color: colors.colorWhite,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10
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
