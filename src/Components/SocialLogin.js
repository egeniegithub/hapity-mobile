import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";

const colors = require("../Theme/Color");

const SocialLogin = props => {
  return (
    <View
      style={{ justifyContent: "center", alignItems: "center", marginTop: 15 }}
    >
      <TouchableOpacity
        onPress={props.onClick}
        style={{
          backgroundColor: props.bgColor,
          height: 50,
          width: "90%",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        {props.loading ? (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 4
            }}
          >
            <Image source={props.icon} style={{ height: 30, width: 30 }} />
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "90%"
              }}
            >
              <Text
                style={{
                  color: colors.colorWhite,
                  fontSize: 18,
                  marginLeft: -15
                }}
              >
                {props.text}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SocialLogin;
