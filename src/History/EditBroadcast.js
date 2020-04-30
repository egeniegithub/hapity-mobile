import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform
} from "react-native";
import { Header, Input, Button } from "react-native-elements";
import { getLoginSL } from "../Storage/StorageLocal";
import { editBroadcast } from "../Network/Network";
import { StackActions, NavigationActions } from "react-navigation";
import ImagePicker from "react-native-image-picker";
import { imageOptions, videoOptions } from "../Config/Constants";
import { headerContainerStyle } from "../Config/Constants";
import { Dialog } from "react-native-simple-dialogs";
import * as Progress from "react-native-progress";

const colors = require("../Theme/Color");

export default class EditBroadcast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      picture: "",
      streamUrl: "",
      streamId: "",
      loadingUpload: false,
      isLocalImage: false,
      imagePath: "",
      videoPath: "",
      uploadingProgress: 0,
      uploadVideoShowDialog: false
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const data = navigation.getParam("data");

    this.setState({
      title: data.title,
      description: data.description,
      picture: data.broadcast_image,
      streamId: data.id,
      streamUrl: data.stream_url
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

  broadcastEdit = () => {
    this.setState(
      {
        loadingUpload: true,
        uploadVideoShowDialog: true
      },
      () => {
        getLoginSL().then(res => {
          editBroadcast(
            res.user_info.token,
            res.user_info.user_id,
            this.state.streamUrl,
            this.state.streamId,
            this.state.title,
            this.state.description,
            this.state.imagePath,
            this.state.videoPath,
            result => {
              if (result.status == "error") {
                this.setState(
                  {
                    loadingUpload: false,
                    uploadVideoShowDialog: false
                  },
                  () => {
                    setTimeout(() => {
                      alert(result.message);
                    }, 100);
                  }
                );
              }

              result = JSON.parse(result.data);
              if (result.response.status == "success") {
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({ routeName: "History" })
                  ]
                });
                this.props.navigation.dispatch(resetAction);
              } else {
                this.setState(
                  {
                    loadingUpload: false,
                    uploadVideoShowDialog: false
                  },
                  () => {
                    alert(result.message);
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

  _pickImage = () => {
    ImagePicker.showImagePicker(imageOptions, response => {
      if (response.error) {
        alert(response.error);
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
          picture: source,
          isLocalImage: true
        });
      }
    });
  };

  _pickVideo = () => {
    ImagePicker.launchImageLibrary(videoOptions, response => {
      if (response.error) {
        alert(response.error);
      } else {
        let source = response.uri;
        let path = "";
        if (Platform.OS === "android") {
          path = response.path;
        } else {
          path = response.origURL;
        }

        this.setState({
          videoPath: path
        });
      }
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          centerComponent={{
            text: "Edit BROADCAST",
            style: { color: "#fff", fontSize: 16, fontWeight: "bold" }
          }}
          containerStyle={headerContainerStyle}
          leftComponent={this.leftArrowGoBack}
        />

        <Dialog
          visible={this.state.uploadVideoShowDialog}
          title="Updating Broadcast..."
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
                {this.state.videoPath == "" ? (
                  <Image
                    style={{ height: 100, width: 100 }}
                    source={require("../../assets/upload_broadcast_video_holo.png")}
                  />
                ) : (
                  <Image
                    style={{ height: 100, width: 100 }}
                    source={require("../../assets/default_broadcast.png")}
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
                <Text style={{ fontWeight: "bold", marginLeft: 5 }}>Video</Text>
              </View>
            </View>
            <View
              style={[{ width: 100, heig2t: 130 }, styles.makeComponentCenter]}
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
                ) : this.state.isLocalImage ? (
                  <Image
                    style={{ height: 100, width: 100 }}
                    source={{
                      uri: "data:image/jpeg;base64," + this.state.picture
                    }}
                  />
                ) : (
                  <Image
                    style={{ height: 100, width: 100 }}
                    source={{ uri: this.state.picture }}
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
              onPress={this.broadcastEdit}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  makeComponentCenter: {
    justifyContent: "center",
    alignItems: "center"
  }
});
