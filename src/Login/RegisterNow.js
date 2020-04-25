import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform
} from "react-native";
import { Header, Icon, Input, CheckBox, Button } from "react-native-elements";
import { doSignUp } from "../Network/Network";
import ImagePicker from "react-native-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { emailRegex, deviceMetaInfo } from "../Config/Function";
import { Dialog } from "react-native-simple-dialogs";
import HTMLView from "react-native-htmlview";
import { htmlText } from "../Config/Constants";
import { StackActions, NavigationActions } from "react-navigation";
import { setLoginSL, setAutoBroadcast } from "../Storage/StorageLocal";
import { imageOptions } from "../Config/Constants";

const colors = require("../Theme/Color");

export default class RegisterNow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      termsCheck: false,
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      profile_picture: "",
      dialogVisible: false,
      termsDialogBox: false,
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

  backButtonArrow = () => {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
        <Icon name="arrow-back" color={colors.colorWhite} />
      </TouchableOpacity>
    );
  };

  _trySignUp = () => {
    if (
      this.state.username == "" ||
      this.state.email == "" ||
      this.state.password == ""
    ) {
      alert("Fill all Fields");
    } else if (!emailRegex(this.state.email)) {
      alert("Wrong Email address");
    } else if (this.state.password != this.state.confirmPassword) {
      alert("Password mismatch.");
    } else if (this.state.termsCheck == false) {
      alert("Please check terms & conditions");
    } else {
      this.setState({ dialogVisible: true });
      doSignUp(
        this.state.username,
        this.state.email,
        this.state.password,
        this.state.profile_picture,
        this.state.metaInfo,
        result => {
          if (result.status == "success") {
            this.setState({ dialogVisible: false }, () => {
              setLoginSL(JSON.stringify(result)).then(() => {
                setAutoBroadcast("false").then(() => {
                  const resetAction = StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({ routeName: "LiveStreaming" })
                    ]
                  });
                  this.props.navigation.dispatch(resetAction);
                });
              });
            });
          } else {
            this.setState({ dialogVisible: false });
            alert(result.message);
          }
        }
      );
    }
  };

  _pickImage = () => {
    ImagePicker.showImagePicker(imageOptions, response => {
      if (response.didCancel) {
      } else if (response.error) {
        alert(response.error);
      } else {
        const source = response.data;
        this.setState({
          profile_picture: source
        });
      }
    });
  };

  render() {
    return (
      <KeyboardAwareScrollView style={{ backgroundColor: colors.colorPrimary }}>
        <View style={styles.mainContainer}>
          {Platform.OS === "android" ? (
            <View
              style={{
                height: 50,
                width: "100%",
                backgroundColor: colors.colorPrimaryDark,
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <View style={{ flex: 1, paddingLeft: 6 }}>
                {this.backButtonArrow()}
              </View>
              <View style={{ flex: 3, alignItems: "center" }}>
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}
                >
                  REGISTER
                </Text>
              </View>
              <View style={{ flex: 1, flexDirection: "row-reverse" }}></View>
            </View>
          ) : (
            <Header
              leftComponent={this.backButtonArrow}
              centerComponent={{
                text: "REGISTER",
                style: { color: "#fff", fontSize: 20, fontWeight: "bold" }
              }}
              containerStyle={{
                backgroundColor: colors.colorPrimaryDark,
                height: Platform.OS === "android" ? 56 : 70,
                paddingBottom: Platform.OS === "android" ? 25 : 0
              }}
            />
          )}

          <Dialog
            visible={this.state.termsDialogBox}
            onTouchOutside={() => this.setState({ termsDialogBox: false })}
            dialogStyle={{ height: "90%" }}
          >
            <View style={{ height: "100%" }}>
              <ScrollView>
                <HTMLView
                  value={htmlText}
                  stylesheet={{
                    fontWeight: "bold",
                    color: "#ffffff"
                  }}
                />
              </ScrollView>
              <View style={styles.btnViewContainer}>
                <Button
                  onPress={() =>
                    this.setState({ termsDialogBox: false, termsCheck: true })
                  }
                  title="Agree"
                  buttonStyle={{ backgroundColor: colors.colorPrimaryDark }}
                  containerStyle={{ width: 90 }}
                />
                <Button
                  onPress={() =>
                    this.setState({ termsDialogBox: false, termsCheck: false })
                  }
                  title="Disagree"
                  buttonStyle={{ backgroundColor: colors.colorPrimaryDark }}
                  containerStyle={{ width: 90 }}
                />
              </View>
            </View>
          </Dialog>

          <TouchableOpacity style={{ marginTop: 15 }} onPress={this._pickImage}>
            {this.state.profile_picture == "" ? (
              <Image
                source={require("../../assets/signUp_profile.png")}
                style={{ width: 150, height: 150, borderRadius: 75 }}
              />
            ) : (
              <Image
                source={{
                  uri: "data:image/jpeg;base64," + this.state.profile_picture
                }}
                style={{ width: 150, height: 150, borderRadius: 75 }}
              />
            )}
          </TouchableOpacity>

          <Input
            placeholder="Username"
            containerStyle={styles.inPutFieldStyle}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            onChangeText={text => this.setState({ username: text })}
            autoCapitalize="none"
          />
          <Input
            placeholder="Email"
            containerStyle={styles.inPutFieldStyle}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            onChangeText={text => this.setState({ email: text })}
            autoCapitalize="none"
          />
          <Input
            secureTextEntry={true}
            placeholder="Password"
            containerStyle={styles.inPutFieldStyle}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            onChangeText={text => this.setState({ password: text })}
            autoCapitalize="none"
          />
          <Input
            secureTextEntry={true}
            placeholder="Confirm Password"
            containerStyle={styles.inPutFieldStyle}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            onChangeText={text => this.setState({ confirmPassword: text })}
            autoCapitalize="none"
          />

          <CheckBox
            title="I agree to terms and conditions"
            size={30}
            checked={this.state.termsCheck}
            onPress={() => this.setState({ termsDialogBox: true })}
            containerStyle={{
              backgroundColor: colors.colorPrimary,
              borderWidth: 0
            }}
          />

          <Button
            disabled={this.state.dialogVisible}
            loading={this.state.dialogVisible}
            onPress={this._trySignUp}
            title="SignUp"
            buttonStyle={{
              backgroundColor: colors.colorPrimaryDark,
              marginBottom: 8
            }}
            containerStyle={{ width: "90%" }}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colorPrimary,
    alignItems: "center"
  },
  makeCenterComponent: {
    justifyContent: "center",
    alignItems: "center"
  },
  inPutFieldStyle: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 5,
    marginTop: 20
  },
  btnViewContainer: {
    height: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
