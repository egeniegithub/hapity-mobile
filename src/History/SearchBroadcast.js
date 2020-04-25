import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  Platform
} from "react-native";
import { deleteBroadcast, getAllBroadcastsForUser } from "../Network/Network";
import { getLoginSL } from "../Storage/StorageLocal";
import { Header, Input, Icon } from "react-native-elements";
import Share from "react-native-share";
import { ProgressDialog } from "react-native-simple-dialogs";
import { StackActions, NavigationActions } from "react-navigation";
import { headerContainerStyle } from "../Config/Constants";
import CustomAppHeader from "../Components/CustomAppHeader";

const colors = require("../Theme/Color");

export default class SearchBroadcast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      originalBroadcastList: [],
      allBroadcasts: [],
      showProgressDialog: false,
      loadingBroadcasts: false,
      searchText: ""
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const data = navigation.getParam("list");
    this.setState({
      allBroadcasts: data,
      originalBroadcastList: data
    });
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
                allBroadcasts: result.broadcast
              });
            } else {
              this.setState({ loadingBroadcasts: false }, () => {
                alert(result.error);
              });
            }
          }
        );
      });
    });
  };

  leftArrowGoBack = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "History" })]
          });
          this.props.navigation.dispatch(resetAction);
        }}
      >
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../../assets/back_arrow.png")}
        />
      </TouchableOpacity>
    );
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
    this.setState({ showProgressDialog: true }, () => {
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
              this.setState({ showProgressDialog: false }, () => {
                this.getBroadcasts();
              });
            } else {
              this.setState(
                {
                  showProgressDialog: false
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

  socialShare = (title, url) => {
    const options = {
      title: "Share Video",
      message: title,
      url: url
    };

    Share.open(options)
      .then(res => {})
      .catch(err => {});
  };

  renderitme = ({ item }) => {
    return (
      <View style={{ margin: 8, flexDirection: "row", height: 100 }}>
        <View style={{ flexDirection: "row", width: "90%" }}>
          <View>
            <Image
              source={{ uri: item.broadcast_image }}
              style={{ width: 100, height: 100 }}
            />
            <View style={{ position: "absolute", top: 35, left: 35 }}>
              <Image
                source={require("../../assets/play_video.png")}
                style={{ width: 30, height: 30 }}
              />
            </View>
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
        </View>
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

  searchBroadcast = () => {
    searchText = this.state.searchText.toLowerCase();
    let newList = [];

    const listLength = this.state.originalBroadcastList.length;
    for (i = 0; i < listLength; i++) {
      if (
        this.state.originalBroadcastList[i].title != null &&
        this.state.originalBroadcastList[i].description != null
      ) {
        let title = this.state.originalBroadcastList[i].title.toLowerCase();
        let description = this.state.originalBroadcastList[
          i
        ].description.toLowerCase();
        if (title.includes(searchText) || description.includes(searchText)) {
          newList.push(this.state.originalBroadcastList[i]);
        }
      }
    }
    this.setState({
      allBroadcasts: [...newList]
    });
  };

  render() {
    return (
      <View>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={this.leftArrowGoBack}
            title="SEARCH BROADCAST"
            rightComponent={() => {
              return null;
            }}
          />
        ) : (
          <Header
            centerComponent={{
              text: "SEARCH BROADCAST",
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

        <View
          style={{
            height: 60,
            backgroundColor: colors.colorLightGray,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10
          }}
        >
          <Input
            containerStyle={{
              backgroundColor: "white",
              width: "95%",
              borderRadius: 10
            }}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            leftIcon={
              <Icon
                name="search"
                size={25}
                color="gray"
                onPress={this.searchBroadcast}
              />
            }
            value={this.state.searchText}
            onChangeText={text =>
              this.setState({ searchText: text }, () => this.searchBroadcast())
            }
          />
        </View>

        <FlatList
          data={this.state.allBroadcasts}
          renderItem={this.renderitme}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loadingBroadcasts}
              onRefresh={this.getBroadcasts}
            />
          }
        />
      </View>
    );
  }
}
