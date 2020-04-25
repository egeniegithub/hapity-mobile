import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Clipboard,
  Platform
} from "react-native";
import { Header, Divider } from "react-native-elements";
import {
  getLoginSL,
  setIsSenstive,
  setInformMe,
  setAutoBroadcast,
  getAutoBroadcast,
  getIsSensitive,
  getInformMe,
  setVideoDownloadLocally,
  getVideoDownloadLocally,
  removeAllStorageData
} from "../Storage/StorageLocal";
import { StackActions, NavigationActions } from "react-navigation";
import { headerContainerStyle } from "../Config/Constants";
import CustomAppHeader from "../Components/CustomAppHeader";

const colors = require("../Theme/Color");

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggel: false,
      authKey: "",
      isSensative: false,
      informMe: false,
      autoBroadcast: false,
      downloadVideoLocally: false,
    };
  }

  componentDidMount() {
    getLoginSL().then(res => {
      this.setState({
        authKey: res.user_info.auth_key
      });
    });

    getIsSensitive().then(res => {
      this.setState({
        isSensative: JSON.parse(res)
      });
    });

    getInformMe().then(res => {
      this.setState({
        informMe: JSON.parse(res)
      });
    });

    getAutoBroadcast().then(res => {
      this.setState({
        autoBroadcast: JSON.parse(res)
      });
    });

    getVideoDownloadLocally().then(res => {
      this.setState({
        downloadVideoLocally: JSON.parse(res)
      });
    });
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

  userLogOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "yes", onPress: () => this.removeAllStorageKeys() },
      { text: "No" }
    ]);
  };

  removeAllStorageKeys = () => {
    removeAllStorageData().then(res => {
      if (res === false) {
        alert("Error! Please Try again.");
      } else {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Splash" })]
        });
        this.props.navigation.dispatch(resetAction);
      }
    });
  };

  writeToClipboard = async () => {
    await Clipboard.setString(this.state.authKey);
    alert("Copied to Clipboard!");
  };

  render() {
    return (
      <View>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={this.leftArrowGoBack}
            title="SETTINGS"
            rightComponent={() => {
              return null;
            }}
          />
        ) : (
          <Header
            centerComponent={{
              text: "SETTINGS",
              style: { color: "#fff", fontSize: 20, fontWeight: "bold" }
            }}
            containerStyle={headerContainerStyle}
            leftComponent={this.leftArrowGoBack}
          />
        )}
        <View style={styles.singleRowContainerStyle}>
          <Text style={styles.singleRowTextStyle}>
            My broadcast's contains sensitive media
          </Text>
          <Switch
            onValueChange={() =>
              this.setState(
                {
                  isSensative: !this.state.isSensative
                },
                () => {
                  setIsSenstive(JSON.stringify(this.state.isSensative)).then(
                    () => {}
                  );
                }
              )
            }
            value={this.state.isSensative}
          />
        </View>
        <Divider style={styles.singleRowDividerStyle} />

        <View style={styles.singleRowContainerStyle}>
          <Text style={styles.singleRowTextStyle}>
            Do not inform me before showing media that may be sensitive{" "}
          </Text>
          <Switch
            onValueChange={() =>
              this.setState(
                {
                  informMe: !this.state.informMe
                },
                () => {
                  setInformMe(JSON.stringify(this.state.informMe)).then(
                    () => {}
                  );
                }
              )
            }
            value={this.state.informMe}
          />
        </View>
        <Divider style={styles.singleRowDividerStyle} />

        <View style={styles.singleRowContainerStyle}>
          <Text style={styles.singleRowTextStyle}>Auto Broadcast </Text>
          <Switch
            onValueChange={() =>
              this.setState(
                {
                  autoBroadcast: !this.state.autoBroadcast
                },
                () => {
                  setAutoBroadcast(
                    JSON.stringify(this.state.autoBroadcast)
                  ).then(() => {});
                }
              )
            }
            value={this.state.autoBroadcast}
          />
        </View>
        <Divider style={styles.singleRowDividerStyle} />

        <View style={styles.singleRowContainerStyle}>
          <Text style={styles.singleRowTextStyle}>Download videos locally</Text>
          <Switch
            onValueChange={() =>
              this.setState(
                {
                  downloadVideoLocally: !this.state.downloadVideoLocally
                },
                () => {
                  setVideoDownloadLocally(
                    JSON.stringify(this.state.downloadVideoLocally)
                  ).then(() => {});
                }
              )
            }
            value={this.state.downloadVideoLocally}
          />
        </View>
        <Divider style={styles.singleRowDividerStyle} />

        <View style={styles.singleRowContainerStyle}>
          <View style={{ width: "85%" }}>
            <Text style={styles.singleRowTextStyle}>Auth Key</Text>
            <Text style={{ marginTop: 4 }}>{this.state.authKey} </Text>
          </View>
          <TouchableOpacity
            onPress={this.writeToClipboard}
            style={{ alignSelf: "center" }}
          >
            <Image
              source={require("../../assets/clipboard.png")}
              style={{ width: 40, height: 45 }}
            />
          </TouchableOpacity>
        </View>
        <Divider style={styles.singleRowDividerStyle} />

        <TouchableOpacity
          onPress={this.userLogOut}
          style={styles.singleRowContainerStyle}
        >
          <Text style={[styles.singleRowTextStyle, { fontSize: 18 }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  singleRowContainerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingLeft: 10,
    paddingRight: 10
  },
  singleRowTextStyle: {
    width: "85%",
    fontWeight: "bold",
    fontSize: 14
  },
  singleRowDividerStyle: {
    backgroundColor: colors.colorLightGray,
    marginTop: 10
  }
});
