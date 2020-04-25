import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform
} from "react-native";
import { Header, Input, Button } from "react-native-elements";
import { imageOptions } from "../Config/Constants";
import ImagePicker from "react-native-image-picker";
import { editProfile } from "../Network/Network";
import { getLoginSL } from "../Storage/StorageLocal";
import { ProgressDialog } from "react-native-simple-dialogs";
import { StackActions, NavigationActions } from "react-navigation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { headerContainerStyle } from "../Config/Constants";
import CustomAppHeader from "../Components/CustomAppHeader";

const colors = require("../Theme/Color");

export default class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      profilePicture: "",
      password: "",
      confirmPassword: "",
      loadingDone: false,
      isLocalImage: false,
      editprofileDialog: false
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.setState({
      name: navigation.getParam("name"),
      email: navigation.getParam("email"),
      profilePicture: navigation.getParam("profilePicture")
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

  profileEdit = () => {
    if (this.state.password != this.state.confirmPassword) {
      alert("Password Mismatch");
    } else {
      this.setState({ editprofileDialog: true }, () => {
        getLoginSL().then(res => {
          editProfile(
            res.user_info.user_id,
            res.user_info.token,
            this.state.name,
            this.state.email,
            this.state.password,
            this.state.profilePicture,
            result => {
              if (result.status == "success") {
                this.setState({ editprofileDialog: false }, () => {
                  setTimeout(() => {
                    this.goToHistoryAfterUpdate("Profile Updated Successfully");
                  }, 100);
                });
              } else {
                this.setState({ editprofileDialog: false }, () => {
                  this.goToHistoryAfterUpdate(result.message);
                });
              }
            }
          );
        });
      });
    }
  };

  goToHistoryAfterUpdate = message => {
    Alert.alert("Alert", message, [
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

  _pickImage = () => {
    ImagePicker.showImagePicker(imageOptions, response => {
      if (response.didCancel) {
      } else if (response.error) {
        alert(response.error);
      } else {
        const source = response.data;
        this.setState({
          profilePicture: source,
          isLocalImage: true
        });
      }
    });
  };

  render() {
    return (
      <KeyboardAwareScrollView>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={this.leftArrowGoBack}
            title="Edit Profile"
            rightComponent={() => {
              return null;
            }}
          />
        ) : (
          <Header
            centerComponent={{
              text: "Edit Profile",
              style: { color: "#fff", fontSize: 18, fontWeight: "bold" }
            }}
            containerStyle={headerContainerStyle}
            leftComponent={this.leftArrowGoBack}
          />
        )}

        <ProgressDialog
          visible={this.state.editprofileDialog}
          title="Profile Updating..."
          message="Please, wait..."
        />

        <View style={{ marginTop: 15, alignItems: "center" }}>
          <TouchableOpacity onPress={this._pickImage}>
            {this.state.profilePicture == "" ||
            this.state.profilePicture == undefined ? (
              <View
                style={{
                  width: 150,
                  height: 150,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  source={require("../../assets/signUp_profile.png")}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    position: "absolute"
                  }}
                />
                <Image
                  source={require("../../assets/camera.png")}
                  style={{ width: 150, height: 150 }}
                />
              </View>
            ) : this.state.isLocalImage ? (
              <View
                style={{
                  width: 150,
                  height: 150,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  style={{
                    height: 150,
                    width: 150,
                    borderRadius: 75,
                    position: "absolute"
                  }}
                  source={{
                    uri: "data:image/jpeg;base64," + this.state.profilePicture
                  }}
                />
                <Image
                  source={require("../../assets/camera.png")}
                  style={{ width: 150, height: 150 }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: 150,
                  height: 150,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Image
                  source={{ uri: this.state.profilePicture }}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    position: "absolute"
                  }}
                />
                <Image
                  source={require("../../assets/camera.png")}
                  style={{ width: 150, height: 150 }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 15, alignItems: "center" }}>
          <Input
            placeholder="UserName"
            containerStyle={styles.inPutFieldContainerStyle}
            inputContainerStyle={styles.inputFieldStyle}
            value={this.state.name}
            onChangeText={text => this.setState({ name: text })}
          />
          <Input
            placeholder="Email"
            containerStyle={styles.inPutFieldContainerStyle}
            inputContainerStyle={styles.inputFieldStyle}
            value={this.state.email}
            onChangeText={text => this.setState({ email: text })}
          />
          <Input
            placeholder="Password"
            containerStyle={styles.inPutFieldContainerStyle}
            inputContainerStyle={styles.inputFieldStyle}
            value={this.state.password}
            onChangeText={text => this.setState({ password: text })}
            autoCapitalize="none"
            secureTextEntry={true}
          />
          <Input
            placeholder="Confirm Password"
            containerStyle={styles.inPutFieldContainerStyle}
            inputContainerStyle={styles.inputFieldStyle}
            value={this.state.confirmPassword}
            onChangeText={text => this.setState({ confirmPassword: text })}
            autoCapitalize="none"
            secureTextEntry={true}
          />
        </View>
        <View style={[styles.makeCenterComponent, { marginTop: 20 }]}>
          <Button
            loading={this.state.loadingDone}
            disabled={this.state.loadingDone}
            title="DONE"
            buttonStyle={{ backgroundColor: colors.colorpurple }}
            containerStyle={{ width: "90%" }}
            onPress={this.profileEdit}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center"
  },
  makeCenterComponent: {
    justifyContent: "center",
    alignItems: "center"
  },
  inPutFieldContainerStyle: {
    backgroundColor: "white",
    width: "90%",
    marginTop: 10
  },
  inputFieldStyle: {
    borderBottomWidth: 0.5,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingLeft: 10
  }
});
