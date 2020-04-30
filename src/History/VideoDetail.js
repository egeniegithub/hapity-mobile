import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Platform
} from "react-native";
import CameraRoll from "@react-native-community/cameraroll";
import { Header } from "react-native-elements";
import Share from "react-native-share";
import { StackActions, NavigationActions } from "react-navigation";
import { getLoginSL } from "../Storage/StorageLocal";
import { deleteBroadcast, videoDownload } from "../Network/Network";
import { ProgressDialog, Dialog } from "react-native-simple-dialogs";
import { headerContainerStyle } from "../Config/Constants";
import * as Progress from "react-native-progress";
import CustomAppHeader from "../Components/CustomAppHeader";

const colors = require("../Theme/Color");

export default class VideoDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      shareUrl: "",
      videoId: "",
      streamUrl: "",
      broadcastImage: "",
      fileName: "",
      showProgressDialog: false,
      downloadVideoDialog: false,
      downloadingProgress: 0
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const item = navigation.getParam("item");
    this.setState({
      videoId: item.id,
      title: item.title,
      shareUrl: item.share_url,
      streamUrl: item.stream_url,
      broadcastImage: item.broadcast_image,
      fileName: item.filename
    });
  }

  broadcastDelete = () => {
    Alert.alert(
      "Delete Broadcast",
      "Are you sure you want to delete this broadcast?",
      [
        {
          text: "Yes",
          onPress: () => {
            this.deleteBroadcastFromServer();
          }
        },
        { text: "NO" }
      ]
    );
  };

  deleteBroadcastFromServer = () => {
    // set State for loading
    this.setState({ showProgressDialog: true }, () => {
      // get user credential from local storage
      getLoginSL().then(res => {
        //delete single broadcast from server
        deleteBroadcast(
          res.user_info.token,
          res.user_info.user_id,
          this.state.streamUrl,
          this.state.videoId,
          result => {
            if (result.status == "success") {
              const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "History" })]
              });
              this.props.navigation.dispatch(resetAction);
            }
            else {
              this.setState({
                showProgressDialog: false
              }, () => {
                setTimeout(() => {
                  alert(result.message)
                }, 200);
              })
            }
          }
        );
      });
    });
  };

  leftArrowGoBack = () => {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../../assets/back_arrow.png")}
        />
      </TouchableOpacity>
    );
  };

  shareVideo = () => {
    const options = {
      title: "Share Video",
      message: this.state.title,
      url: this.state.shareUrl
    };

    Share.open(options)
      .then(res => {})
      .catch(err => {});
  };

  downloadVideo = () => {
    this.setState({ downloadVideoDialog: true }, () => {
      videoDownload(
        this.state.fileName,
        result => {
          if (result.status == "success") {
            CameraRoll.saveToCameraRoll(result.path())
              .then(() => {
                result.flush();
                this.setState({ downloadVideoDialog: false }, () => {
                  setTimeout(() => {
                    alert("Video successfully downloaded.");
                  }, 100);
                });
              })
              .catch(e => {
                this.setState({ downloadVideoDialog: false }, () => {
                  setTimeout(() => {
                    alert("Error! Please try again.");
                  }, 100);
                });
              });
          } else {
            this.setState({ downloadVideoDialog: false }, () => {
              setTimeout(() => {
                alert(result.message);
              }, 100);
            });
          }
        },
        progress => {
          this.setState({ downloadingProgress: progress });
        }
      );
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={this.leftArrowGoBack}
            title="Detail"
            rightComponent={() => {
              return null;
            }}
          />
        ) : (
          <Header
            centerComponent={{
              text: "Detail",
              style: { color: "#fff", fontSize: 20, fontWeight: "bold" }
            }}
            containerStyle={headerContainerStyle}
            leftComponent={this.leftArrowGoBack}
          />
        )}
        <ProgressDialog
          visible={this.state.showProgressDialog}
          title="Delete Broadcast"
          message="Please, wait..."
        />
        <Dialog
          visible={this.state.downloadVideoDialog}
          title="Video Downloading ..."
        >
          <View style={{ alignItems: "center" }}>
            <Progress.Circle
              size={60}
              color={colors.colorPrimary}
              borderWidth={0.5}
              progress={this.state.downloadingProgress}
            />
          </View>
        </Dialog>

        <View style={{ flex: 1 }} scrollEnabled={false}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.colorPrimary,
              alignSelf: "center",
              margin: 10,
              height: 25
            }}
          >
            {this.state.title}{" "}
          </Text>

          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            {this.state.broadcastImage == "" ? (
              <Image
                style={{
                  width: "100%",
                  height: Dimensions.get("window").height / 1.4
                }}
                source={require("../../assets/default_broadcast.png")}
                resizeMode="contain"
              />
            ) : (
              <Image
                style={{
                  width: "100%",
                  height: Dimensions.get("window").height / 1.4
                }}
                source={{ uri: this.state.broadcastImage }}
                resizeMode="contain"
              />
            )}

            {this.state.streamUrl != "" ? (
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate("VideoPlay", {
                    streamUrl: this.state.streamUrl
                  })
                }
                style={{
                  position: "absolute",
                  top: Dimensions.get("window").height / 3,
                  left: Dimensions.get("window").width / 2.3
                }}
              >
                <Image
                  source={require("../../assets/play_video.png")}
                  style={{ width: 50, height: 50 }}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.footerContainerStyle}>
          {this.state.streamUrl != "" ? (
            <TouchableOpacity onPress={this.downloadVideo}>
              <Image
                style={{ width: 30, height: 30, marginLeft: 20 }}
                source={require("../../assets/download_white.png")}
              />
            </TouchableOpacity>
          ) : (
            <View></View>
          )}

          <TouchableOpacity onPress={this.broadcastDelete}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/ic_delete_white.png")}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.shareVideo}>
            <Image
              style={{ width: 30, height: 30, marginRight: 20 }}
              source={require("../../assets/ic_share_white.png")}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footerContainerStyle: {
    height: 60,
    backgroundColor: colors.colorPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
