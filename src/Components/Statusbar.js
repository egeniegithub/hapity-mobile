import React from "react";
import { StatusBar } from "react-native";
const colors = require("../Theme/Color");

const Statusbar = () => {
  return (
    <StatusBar
      backgroundColor={colors.colorPrimaryDark}
      barStyle="light-content"
    />
  );
};

export default Statusbar;
