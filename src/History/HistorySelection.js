import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
  CameraRoll,
  Platform
} from "react-native";
import { Header } from "react-native-elements";
import Share from "react-native-share";
import { StackActions, NavigationActions } from "react-navigation";
import { getLoginSL } from "../Storage/StorageLocal";
import { deleteBroadcast, videoDownload } from "../Network/Network";
import { ProgressDialog, Dialog } from "react-native-simple-dialogs";
import * as Progress from "react-native-progress";
import { headerContainerStyle } from "../Config/Constants";
import CustomAppHeader from "../Components/CustomAppHeader";

const colors = require("../Theme/Color");

export default class HistorySelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allBroadcasts: [],
      showProgressDialog: false,
      downloadVideoDialog: false,
      downloadingProgress: 0
    };
    this.filesToDownload = [];
    this.imageHeight = Dimensions.get("window").width / 3 - 15;
    this.imageWidth = Dimensions.get("window").width / 3.5;

    this.playIconTop = Dimensions.get("window").width / 8 - 5;
    this.playIconLeft = Dimensions.get("window").width / 10;
  }

  componentDidMount() {
    const { navigation } = this.props;
    let data = navigation.getParam("list");
    data = data.map(item => {
      item.isSelect = false;
      return item;
    });
    this.setState({ allBroadcasts: data });
  }

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

  broadcastDelete = () => {
    let selectedBroadcast = false;
    let numberOfBroadcast = this.state.allBroadcasts.length;
    for (i = 0; i < numberOfBroadcast; i++) {
      if (this.state.allBroadcasts[i].isSelect) {
        selectedBroadcast = true;
      }
    }

    if (selectedBroadcast) {
      Alert.alert(
        "Delete Broadcasts",
        "Are you sure you want to delete selected broadcasts?",
        [
          {
            text: "Yes",
            onPress: () => {
              this.setState({ showProgressDialog: true });
              let numberOfBroadcast = this.state.allBroadcasts.length;
              for (i = 0; i < numberOfBroadcast; i++) {
                if (this.state.allBroadcasts[i].isSelect) {
                  this.deleteBroadcastFromServer(
                    this.state.allBroadcasts[i].id,
                    this.state.allBroadcasts[i].stream_url
                  );
                }
              }

              this.setState({ showProgressDialog: false }, () => {
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({ routeName: "History" })
                  ]
                });
                this.props.navigation.dispatch(resetAction);
              });
            }
          },
          { text: "NO" }
        ]
      );
    } else {
      alert("Please select any video.");
    }
  };

  deleteBroadcastFromServer = (id, stream_url) => {
    // get user credential from local storage
    getLoginSL().then(res => {
      //delete single broadcast from server
      deleteBroadcast(
        res.user_info.token,
        res.user_info.user_id,
        stream_url,
        id,
        result => {}
      );
    });
  };

  socialShare = () => {
    let urlVideo = "";

    let numberOfBroadcast = this.state.allBroadcasts.length;
    for (i = 0; i < numberOfBroadcast; i++) {
      if (this.state.allBroadcasts[i].isSelect) {
        urlVideo =
          urlVideo +
          this.state.allBroadcasts[i].title +
          " : " +
          this.state.allBroadcasts[i].share_url +
          "\n";
      }
    }
    // ios does not display worng url.
    const options = {
      title: "Share Video",
      message: urlVideo,
      url: ""
    };

    if (urlVideo != "") {
      Share.open(options)
        .then(res => {})
        .catch(err => {});
    } else {
      alert("Please select any video.");
    }
  };

  selectItem = data => {
    data.isSelect = !data.isSelect;

    const index = this.state.allBroadcasts.findIndex(
      item => data.id === item.id
    );
    this.state.allBroadcasts[index] = data;
    this.setState({ allBroadcasts: [...this.state.allBroadcasts] });
  };

  downloadVideo = () => {
    let numberOfBroadcast = this.state.allBroadcasts.length;
    for (i = 0; i < numberOfBroadcast; i++) {
      if (this.state.allBroadcasts[i].isSelect) {
        this.filesToDownload.push(this.state.allBroadcasts[i].filename);
      }
    }
    if (this.filesToDownload.length != 0) {
      this.downloadVideoFromServer();
    } else {
      alert("Please select any video.");
    }
  };

  downloadVideoFromServer = () => {
    if (this.filesToDownload.length != 0) {
      let file = this.filesToDownload.pop();

      this.setState({ downloadVideoDialog: true }, () => {
        videoDownload(
          file,
          result => {
            if (result.status == "success") {
              CameraRoll.saveToCameraRoll(result.path())
                .then(() => {
                  result.flush();
                  this.setState({ downloadingProgress: 0 }, () => {
                    this.downloadVideoFromServer();
                  });
                })
                .catch(e => {
                  this.downloadVideoFromServer();
                });
            } else {
              this.setState(
                {
                  downloadVideoDialog: false
                },
                () => {
                  alert(result.error);
                }
              );
            }
          },
          progress => {
            this.setState({ downloadingProgress: progress });
          }
        );
      });
    } else {
      this.setState({ downloadVideoDialog: false }, () => {
        alert("Video Downloaded Successfully.");
      });
    }
  };

  renderitem = ({ item }) => {
    return (
      <View style={{ margin: 10 }}>
        <TouchableOpacity onPress={() => this.selectItem(item)}>
          {item.isSelect ? (
            <Image
              source={require("../../assets/img_selection.png")}
              style={{ width: this.imageWidth, height: this.imageHeight }}
            />
          ) : (
            <View>
              <Image
                source={{ uri: item.broadcast_image }}
                style={{ width: this.imageWidth, height: this.imageHeight }}
              />
              <View
                style={{
                  position: "absolute",
                  top: this.playIconTop,
                  left: this.playIconLeft
                }}
              >
                <Image
                  source={require("../../assets/play_video.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.mainContainer}>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={this.leftArrowGoBack}
            title="HISTORY SELECTION"
            rightComponent={() => {
              return null;
            }}
          />
        ) : (
          <Header
            centerComponent={{
              text: "HISTORY SELECTION",
              style: { color: "#fff", fontSize: 18, fontWeight: "bold" }
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

        <ScrollView>
          <FlatList
            data={this.state.allBroadcasts}
            renderItem={this.renderitem}
            keyExtractor={item => item.id}
            numColumns={3}
          />
        </ScrollView>
        <View
          style={{
            height: 60,
            backgroundColor: colors.colorPrimary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <TouchableOpacity onPress={this.downloadVideo}>
            <Image
              style={{ width: 30, height: 30, marginLeft: 20 }}
              source={require("../../assets/download_white.png")}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.broadcastDelete}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/ic_delete_white.png")}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.socialShare()}>
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
  mainContainer: {
    flex: 1
  }
});
