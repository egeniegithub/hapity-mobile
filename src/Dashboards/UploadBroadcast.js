import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from "react-native";
import { Header, Input, Button } from "react-native-elements";
import { getLoginSL } from "../Storage/StorageLocal";
import { uploadBroadcast } from "../Network/Network";
import { StackActions, NavigationActions } from "react-navigation";
import ImagePicker from "react-native-image-picker";
import { Dialog } from "react-native-simple-dialogs";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { headerContainerStyle } from "../Config/Constants";
import { requsetCameraPermissionAndroid } from "../Permissions/AndroidPermission";
import Permissions from "react-native-permissions";
import AndroidOpenSettings from "react-native-android-open-settings";
import { Icon } from "react-native-elements";
import CustomAppHeader from "../Components/CustomAppHeader";
import { deviceMetaInfo } from '../Config/Function';

import * as Progress from "react-native-progress";

const colors = require("../Theme/Color");

const optionsImage = {
  title: "Select Image",
  quality: 0.3
  // storageOptions: {
  //     skipBackup: true,
  //     path: 'images',
  // },
};

const optionsVideos = {
  title: "Select Video",
  quality: 0.3,
  mediaType: "video"
  // storageOptions: {
  //     skipBackup: true,
  //     path: 'images',
  // },
};

export default class UploadBroadcast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      picture: "",
      video: "",
      loadingUpload: false,
      imagePath: "",
      videoPath: "",
      uploadingProgress: 0,
      uploadVideoShowDialog: false,
      goToSettings: false,
      metaInfo: {},
    };
  }

  componentDidMount () {
    deviceMetaInfo().then(res => {
      this.setState({
        metaInfo: res
      });
    });
  }

  broadcastUpload = () => {
    let today = new Date();
    let time =
      today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
    let date =
      today.getFullYear() + "" + today.getMonth() + "" + today.getDate();
    let miliSecond = today.getMilliseconds();
    streamName = time + date + miliSecond + ".stream";
    this.setState(
      {
        loadingUpload: true,
        uploadVideoShowDialog: true
      },
      () => {
        getLoginSL().then(res => {
          uploadBroadcast(
            res.user_info.token,
            res.user_info.user_id,
            streamName,
            this.state.title,
            this.state.description,
            "no",
            "0,0",
            "true",
            this.state.imagePath,
            this.state.videoPath,
            this.state.metaInfo,
            result => {
              if (result.status == "error") {
                this.setState(
                  {
                    loadingUpload: false,
                    uploadVideoShowDialog: false
                  },
                  () => {
                    setTimeout(() => {
                      this.goToHistoryAfterUploadFailed(result.message);
                    }, 100);
                  }
                );
              }

              result = JSON.parse(result.data);
              if (result.response.status == "success") {
                this.setState(
                  {
                    loadingUpload: false,
                    uploadVideoShowDialog: false
                  },
                  () => {
                    setTimeout(() => {
                      this.goToHistoryAfterUpload();
                    }, 200);
                  }
                );
              }
            },
            progress => {
              this.setState({ uploadingProgress: progress });
            }
          );
        });
      }
    );
  };

  goToHistoryAfterUpload = () => {
    Alert.alert("Upload Broadcast", "Broadcast Uploaded Successfully", [
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

  goToHistoryAfterUploadFailed = message => {
    Alert.alert("Upload Broadcast", message, [
      {
        text: "OK",
        onPress: () => {}
      }
    ]);
  };

  handleGalleryPermission = async callback => {
    if (Platform.OS == "android") {
      let granted = await requsetCameraPermissionAndroid();
      if (granted) {
        callback(true);
      } else if (granted === undefined) {
        return;
      } else if (!granted) {
        this.setState({
          goToSettings: true
        });
      }
    } else {
      Permissions.check("photo").then(response => {
        if (response == "authorized") {
          callback(true);
        } else if (response == "undetermined") {
          callback(true);
        } else {
          Permissions.request("photo").then(response => {
            if (response == "denied") {
              this.setState({
                goToSettings: true
              });
            } else if (response == "restricted") {
              alert("Could not get permission from device.");
              callback(false);
            }
          });
        }
      });
    }
  };

  _pickImage = () => {
    this.handleGalleryPermission(result => {
      if (result) {
        ImagePicker.showImagePicker(optionsImage, response => {
          if (response.didCancel) {
          } else if (response.error) {
          } else {
            const source = response.data;
            let path = "";
            if (Platform.OS === "android") {
              path = response.path;
            } else {
              path = response.origURL;
            }

            this.setState({
              imagePath: path,
              picture: source
            });
          }
        });
      }
    });
  };

  _pickVideo = () => {
    this.handleGalleryPermission(result => {
      if (result) {
        ImagePicker.launchImageLibrary(optionsVideos, response => {
          if (response.didCancel) {
          } else if (response.error) {
          } else if (response.customButton) {
          } else {
            let source = response.uri;
            let path = "";
            if (Platform.OS === "android") {
              path = response.path;
            } else {
              source = response.origURL;
              path = response.origURL;
            }

            this.setState({
              video: source,
              videoPath: path
            });
          }
        });
      }
    });
  };

  goToDevicePErmissionSetting = () => {
    if (Platform.OS == "android") {
      AndroidOpenSettings.appDetailsSettings();
    } else {
      Permissions.openSettings();
    }
  };

  render() {
    let settingNameForPermission = "";
    if (Platform.OS == "android") {
      settingNameForPermission = "storage";
    } else {
      settingNameForPermission = "Photos";
    }

    return (
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView>
          {Platform.OS === "android" ? (
            <CustomAppHeader
              leftComponent={() => {
                return null;
              }}
              title="UPLOAD BROADCAST"
              rightComponent={() => {
                return null;
              }}
            />
          ) : (
            <Header
              centerComponent={{
                text: "UPLOAD BROADCAST",
                style: { color: "#fff", fontSize: 18, fontWeight: "bold" }
              }}
              containerStyle={headerContainerStyle}
            />
          )}
          <Dialog
            visible={this.state.goToSettings}
            title="Enable Permissions!"
            onTouchOutside={() => this.setState({ goToSettings: false })}
          >
            <View
              style={{
                height: 100
              }}
            >
              <Text style={{ margin: 8 }}>
                Please enable {settingNameForPermission} permission from
                settings.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  margin: 8,
                  justifyContent: "flex-end"
                }}
              >
                <TouchableOpacity
                  style={{ margin: 8 }}
                  onPress={() => this.setState({ goToSettings: false })}
                >
                  <Text style={{ color: colors.colorPrimary, fontSize: 18 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ margin: 8 }}
                  onPress={this.goToDevicePErmissionSetting}
                >
                  <Text style={{ color: colors.colorPrimary, fontSize: 18 }}>
                    Enable
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Dialog>

          <Dialog
            visible={this.state.uploadVideoShowDialog}
            title="Video Uploading..."
          >
            <View style={{ alignItems: "center" }}>
              <Progress.Circle
                size={60}
                color={colors.colorPrimary}
                borderWidth={0.5}
                progress={this.state.uploadingProgress}
              />
            </View>
          </Dialog>

          <View style={{ margin: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Title</Text>

            <Input
              placeholder="Enter Title"
              inputContainerStyle={{
                borderWidth: 0.3,
                borderBottomWidth: 0.3,
                marginTop: 8,
                paddingLeft: 8,
                borderRadius: 4
              }}
              value={this.state.title}
              onChangeText={text => this.setState({ title: text })}
            />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>
              Description
            </Text>

            <TextInput
              multiline={true}
              style={{
                borderWidth: 0.3,
                padding: 8,
                height: 100,
                margin: 8,
                borderColor: "grey",
                borderRadius: 4,
                textAlignVertical: "top"
              }}
              value={this.state.description}
              onChangeText={text => this.setState({ description: text })}
            />

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 4 }}>
                Upload a video or Picture
              </Text>
            </View>

            <View
              style={{
                height: 130,
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop: 8
              }}
            >
              <View style={{ width: 100, height: 130 }}>
                <TouchableOpacity onPress={this._pickVideo}>
                  {this.state.video == "" ? (
                    <Image
                      style={{ height: 100, width: 100 }}
                      source={require("../../assets/upload_broadcast_video_holo.png")}
                    />
                  ) : (
                    <Image
                      style={{ height: 100, width: 100 }}
                      source={{ uri: this.state.video }}
                    />
                  )}
                </TouchableOpacity>
                <View
                  style={[
                    styles.makeComponentCenter,
                    { flexDirection: "row", marginTop: 5 }
                  ]}
                >
                  <Image
                    style={{ height: 22, width: 22 }}
                    source={require("../../assets/play_video.png")}
                  />
                  <Text style={{ fontWeight: "bold", marginLeft: 5 }}>
                    Video
                  </Text>
                </View>
              </View>
              <View
                style={[
                  { width: 100, heig2t: 130 },
                  styles.makeComponentCenter
                ]}
              >
                <Image
                  style={{ height: 50, width: 50 }}
                  source={require("../../assets/ic_or.png")}
                />
              </View>
              <View style={{ width: 100, height: 130 }}>
                <TouchableOpacity onPress={this._pickImage}>
                  {this.state.picture == "" ? (
                    <Image
                      style={{ height: 100, width: 100 }}
                      source={require("../../assets/upload_broadcast_pic_holo.png")}
                    />
                  ) : (
                    <Image
                      style={{ height: 100, width: 100 }}
                      source={{
                        uri: "data:image/jpeg;base64," + this.state.picture
                      }}
                    />
                  )}
                </TouchableOpacity>
                <View
                  style={[
                    styles.makeComponentCenter,
                    { flexDirection: "row", marginTop: 5 }
                  ]}
                >
                  <Image
                    style={{ height: 22, width: 22 }}
                    source={require("../../assets/upload_broadcast_pic_green.png")}
                  />
                  <Text style={{ fontWeight: "bold", marginLeft: 5 }}>
                    Picture
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.makeComponentCenter}>
              <Image
                style={{ width: 100, height: 100 }}
                source={require("../../assets/ic_upload_green.png")}
              />
            </View>

            <View style={[styles.makeComponentCenter, { marginTop: 8 }]}>
              <Button
                loading={this.state.loadingUpload}
                disabled={this.state.loadingUpload}
                title="UPLOAD"
                buttonStyle={{ backgroundColor: colors.colorpurple }}
                containerStyle={{ width: "90%" }}
                onPress={this.broadcastUpload}
              />
            </View>
            <Text style={{marginVertical: 8, alignSelf:'center', fontSize: 18}}>4k videos are not supported.</Text>
          </View>
        </KeyboardAwareScrollView>

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
  makeComponentCenter: {
    justifyContent: "center",
    alignItems: "center"
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
