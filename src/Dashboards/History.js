import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  Platform
} from "react-native";
import { Header, Icon } from "react-native-elements";
import { getAllBroadcastsForUser, deleteBroadcast } from "../Network/Network";
import { getLoginSL, getVideoDownloadLocally } from "../Storage/StorageLocal";
import Share from "react-native-share";
import { headerContainerStyle } from "../Config/Constants";
import CustomAppHeader from "../Components/CustomAppHeader";
import { downloadPendingStream } from '../Config/Function';
import BackgroundTimer from 'react-native-background-timer';
import { requsetCameraPermissionAndroid } from "../Permissions/AndroidPermission";

const colors = require("../Theme/Color");

export default class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingBroadcasts: false,
      allBroadcasts: []
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {

        let granted = await requsetCameraPermissionAndroid();
        console.log('Permission Granted : ' , granted);
        if (granted) {
          const timeoutId = BackgroundTimer.setTimeout(() => {
            getVideoDownloadLocally().then(res => {
              console.log('getVideoDownloadLocally : ', res);
              if (res !== null && res === 'true') {
                downloadPendingStream(timeoutId);
              } else {
                BackgroundTimer.clearTimeout(timeoutId);
              }
            })
          }, 3000);
        }
    }
    else {
      BackgroundTimer.stop();
      setTimeout(() => {
        BackgroundTimer.start();
        getVideoDownloadLocally().then(res => {
          console.log('getVideoDownloadLocally : ', res);
          if (res !== null && res === 'true') {
            downloadPendingStream();
          }
        })
      }, 3000)
    }
    this.getBroadcasts();
  }

  getBroadcasts = () => {
    // set State for loading
    this.setState({ loadingBroadcasts: true }, () => {
      // get user credential from local storage
      getLoginSL().then(res => {
        //get all user broadcast from server
        getAllBroadcastsForUser(
          res.user_info.token,
          res.user_info.user_id,
          result => {
            if (result.status == "success") {
              this.setState({
                loadingBroadcasts: false,
                allBroadcasts: result.broadcasts
              });
            } else {
              this.setState({ loadingBroadcasts: false }, () => {
                alert(result.message);
              });
            }
          }
        );
      });
    });
  };

  broadcastDelete = (id, stream_url) => {
    Alert.alert(
      "Delete Broadcast",
      "Are you sure you want to delete this broadcast?",
      [
        {
          text: "Yes",
          onPress: () => {
            this.deleteBroadcastFromServer(id, stream_url);
          }
        },
        { text: "NO" }
      ]
    );
  };

  deleteBroadcastFromServer = (id, stream_url) => {
    // set State for loading
    this.setState({ loadingBroadcasts: true }, () => {
      // get user credential from local storage
      getLoginSL().then(res => {
        //delete single broadcast from server
        deleteBroadcast(
          res.user_info.token,
          res.user_info.user_id,
          stream_url,
          id,
          result => {
            if (result.status == "success") {
              this.getBroadcasts();
            } else {
              this.setState(
                {
                  loadingBroadcasts: false
                },
                () => {
                  alert(result.error);
                }
              );
            }
          }
        );
      });
    });
  };

  headerRightComponent = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          width: 100,
          justifyContent: "space-around"
        }}
      >
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate("HistorySelection", {
              list: this.state.allBroadcasts
            })
          }
        >
          <Image
            source={require("../../assets/grid_checkbox.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate("SearchBroadcast", {
              list: this.state.allBroadcasts
            })
          }
        >
          <Image
            source={require("../../assets/search.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  socialShare = (title, url) => {
    const options = {
      title: "Share Video",
      message: title,
      url: url
    };

    Share.open(options)
      .then(res => { })
      .catch(err => { });
  };

  renderItem = ({ item }) => {
    if (item.title == "") {
      item.title = "Untitled";
    }
    return (
      <View style={{ margin: 8, flexDirection: "row", height: 100 }}>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate("VideoDetail", {
              item: item
            })
          }
          style={{ flexDirection: "row", width: "90%" }}
        >
          <View>
            <Image
              source={{ uri: item.broadcast_image }}
              style={{ width: 100, height: 100 }}
            />
            {item.stream_url != "" ? (
              <View style={{ position: "absolute", top: 35, left: 35 }}>
                <Image
                  source={require("../../assets/play_video.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
            ) : null}
          </View>
          <View style={{ width: "65%" }}>
            <Text
              style={{
                marginLeft: 8,
                fontWeight: "bold",
                fontSize: 18,
                color: colors.colorPrimary
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={{
                marginLeft: 8,
                fontWeight: "bold",
                fontSize: 12,
                color: colors.colorPrimary,
                marginTop: 4
              }}
              numberOfLines={4}
            >
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ width: "10%" }}>
          <TouchableOpacity
            onPress={() => this.broadcastDelete(item.id, item.stream_url)}
          >
            <Image
              source={require("../../assets/ic_delete_green.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.socialShare(item.title, item.share_url)}
          >
            <Image
              source={require("../../assets/ic_share_green.png")}
              style={{ width: 25, height: 25, marginTop: 6, marginBottom: 6 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate("EditBroadcast", {
                data: item
              })
            }
          >
            <Image
              source={require("../../assets/ic_edit_green.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.mainContainer}>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={() => {
              return null;
            }}
            title="History"
            rightComponent={this.headerRightComponent}
          />
        ) : (
            <Header
              statusBarProps={{
                barStyle: "light-content",
                backgroundColor: colors.colorPrimary
              }}
              barStyle="light-content"
              centerComponent={{
                text: "History",
                style: { color: "#fff", fontSize: 20, fontWeight: "bold" }
              }}
              containerStyle={headerContainerStyle}
              rightComponent={this.headerRightComponent}
            />
          )}
        <FlatList
          data={this.state.allBroadcasts}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loadingBroadcasts}
              onRefresh={this.getBroadcasts}
            />
          }
        />
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("LiveStreaming", {
              firstLaunch: false
            });
          }}
          style={styles.videoStreamIcon}
        >
          <Image
            source={require("../../assets/video_stream_white.png")}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  videoStreamIcon: {
    marginTop: 15,
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 60,
    height: 60,
    backgroundColor: colors.colorPrimary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30
  }
});
