import React from "react";
import { StyleSheet, Platform, NativeModules } from "react-native";
// import BroadcastView from "react-native-wowza-gocoder";

var BroadcastManager = NativeModules.BroadcastModule;

export default class CameraBroadcastView extends React.Component {
  onBroadcastStart() {}
  onBroadcastFail(err) {}
  onBroadcastStatusChange() {}
  onBroadcastEventReceive() {}
  onBroadcastErrorReceive() {}
  onBroadcastVideoEncoded = () => {};
  onBroadcastStop = () => {
    if (Platform.OS === "android") {
      BroadcastManager.stopTimer();
    }
  };

  render() {
    const { isFlashOn, isFrontCamera, keyboardNotOpen } = this.props;
    let sdkKey = "";
    if (Platform.OS == "android") {
      sdkKey = "GOSK-C246-010C-21B8-7444-C3CF";
    } else {
      sdkKey = "GOSK-C246-010C-D03B-95DB-7E58";
    }

    let config = {
      hostAddress: "",
      applicationName: "live",
      username: "wozpubuser",
      password: "Pu8Eg3n3_",
      streamName: "",
      sdkLicenseKey: sdkKey
    };

    if (keyboardNotOpen) {
      return ( null
        // <BroadcastView
        //   style={styles.videoContainer}
        //   hostAddress={config.hostAddress}
        //   applicationName={config.applicationName}
        //   broadcastName={config.streamName}
        //   broadcasting={false}
        //   username={config.username}
        //   password={config.password}
        //   sizePreset={1}
        //   port={1935}
        //   muted={false}
        //   flashOn={isFlashOn}
        //   frontCamera={isFrontCamera}
        //   onBroadcastStart={this.onBroadcastStart}
        //   onBroadcastFail={this.onBroadcastFail}
        //   onBroadcastStatusChange={this.onBroadcastStatusChange}
        //   onBroadcastEventReceive={this.onBroadcastEventReceive}
        //   onBroadcastErrorReceive={this.onBroadcastErrorReceive}
        //   onBroadcastVideoEncoded={this.onBroadcastVideoEncoded}
        //   onBroadcastStop={this.onBroadcastStop}
        //   sdkLicenseKey={config.sdkLicenseKey}
        // />
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  videoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
