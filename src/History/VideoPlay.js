import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import { Header } from "react-native-elements";
import { headerContainerStyle } from "../Config/Constants";
import Video from "react-native-video";
import KeepAwake from "react-native-keep-awake";
import CustomAppHeader from "../Components/CustomAppHeader";
import { WebView } from 'react-native-webview';
let colors = require("../Theme/Color");

export default class VideoPlay extends React.Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const streamUrl = navigation.getParam("streamUrl");
    this.state = {
      videoBuffering: true,
      streamUrl: streamUrl
    };
  }

  leftArrowGoBack = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.goBack();
        }}
      >
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../../assets/back_arrow.png")}
        />
      </TouchableOpacity>
    );
  };

  onEndBroadcast = () => {
    Alert.alert("Alert", "Broadcast End", [
      {
        text: "OK",
        onPress: () => {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "History" })]
          });
          this.props.navigation.dispatch(resetAction);
        }
      }
    ]);
  };

  corruptedVideo = () => {
    this.setState(
      {
        videoBuffering: false
      },
      () => {
        Alert.alert("Corrupt Video", "Sorry! Video could not be played. ", [
          {
            text: "OK",
            onPress: () => {
              const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "History" })]
              });
              this.props.navigation.dispatch(resetAction);
            }
          }
        ]);
      }
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <KeepAwake />
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={this.leftArrowGoBack}
            title="Video"
            rightComponent={() => {
              return null;
            }}
          />
        ) : (
          <Header
            centerComponent={{
              text: "Video",
              style: { color: "#fff", fontSize: 20, fontWeight: "bold" }
            }}
            containerStyle={headerContainerStyle}
            leftComponent={this.leftArrowGoBack}
          />
        )}
        {
          Platform.OS === 'android' ?
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.colorBlack
              }}
            >
              {this.state.videoBuffering ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <ActivityIndicator size="small" color={colors.colorWhite} />
                </View>
              ) : null}

              <Video
                source={{ uri: this.state.streamUrl }}
                rate={1.0}
                volume={1.0}
                resizeMode="contain"
                fullscreen={true}
                shouldPlay
                isLooping={false}
                controls={true}
                onEnd={this.onEndBroadcast}
                onBuffer={() => this.setState({ videoBuffering: false })}
                onError={this.corruptedVideo}
                style={{
                  height: Dimensions.get("window").height / 1.2,
                  width: Dimensions.get("window").width
                }}
              />
            </View>
            :
            <View
              style={{
                flex: 1,
              }}
            >
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `<html>
                        <body>
                          <video width="100%" height="100%" controls autoplay poster="https://staging.hapity.com/images/black-screen.jpg">
                            <source src=${this.state.streamUrl} type="video/mp4">
                            Video Can not be Played.
                          </video>
                        </body>
                  </html>`
                }}
                style={{ marginBottom: 15 }}
              />
            </View>
        }
      </View>
    );
  }
}
