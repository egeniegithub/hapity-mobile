import React from "react";
import { View, Text } from "react-native";

import * as colors from "../Theme/Color";

const CustomAppHeader = props => {
  return (
    <View
      style={{
        height: 50,
        width: "100%",
        backgroundColor: colors.colorPrimary,
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      <View style={{ flex: 1, paddingLeft: 6 }}>{props.leftComponent()}</View>
      <View style={{ flex: 3, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          {props.title}
        </Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row-reverse" }}>
        {props.rightComponent()}
      </View>
    </View>
  );
};

export default CustomAppHeader;
