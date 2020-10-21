import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  NativeModules,
  Platform
} from "react-native";
import { Header } from "react-native-elements";
import { getProfileInfo } from "../Network/Network";
import {
  getLoginSL,
  getTwitterAuthToken,
  setTwitterSharing,
  setTwitterAuthToken,
  getTwitterSharing,
  setTwitterAuthTokenSecret
} from "../Storage/StorageLocal";
import { TwitterConstants } from "../Config/Constants";
import { headerContainerStyle } from "../Config/Constants";
import { broadcastShareOnTwitter } from "../Config/Function";
import CustomAppHeader from "../Components/CustomAppHeader";
import { WebView } from 'react-native-webview';

const { RNTwitterSignIn } = NativeModules;
import * as colors from "../Theme/Color";
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';

export default class MyAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      profilePicture: "",
      email: "",
      isTwitterSharingOn: false,
      showYouyubeAuthView: false
    };
  }

  componentDidMount() {
    GoogleSignin.configure({
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      webClientId: '964621052095-230dbm2kb20r4d2e9k900g5qp1bl7qek.apps.googleusercontent.com',
      androidClientId: '964621052095-mhrisqas4t4rfi1v374j67dmehfbil7j.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/youtube']
    });
    getLoginSL().then(res => {
      getProfileInfo(res.user_info.token, result => {
        if (result.status == "success") {
          this.setState({
            name: result.profile_info.username,
            profilePicture: result.profile_info.profile_picture,
            email: result.profile_info.email
          });
        } else {
        }
      });
    });
    getTwitterSharing().then(res => {
      this.setState({ isTwitterSharingOn: JSON.parse(res) });
    });
  }

  googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(' Data from signIn  : ', userInfo);
    } catch (error) {
      alert(error);
      console.log('Error while login :  ', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  headerRightSettingIcon = () => {
    return (
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate("Settings")}
        style={{ marginRight: 4, paddingRight: 4 }}
      >
        <Image
          style={{ height: 22, width: 22 }}
          source={require("../../assets/settings.png")}
        />
      </TouchableOpacity>
    );
  };

  goToHelpPage = () => {
    url = "https://www.hapity.com/help";
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error("An error occurred : ", err));
  };

  twitterSharing = () => {
    if (this.state.isTwitterSharingOn) {
      setTwitterSharing("false").then(() => {
        this.setState({ isTwitterSharingOn: false });
      });
    } else {
      getTwitterAuthToken().then(res => {
        if (res === null) {
          this.twitterLogin();
        } else {
          setTwitterSharing("true").then(() => {
            this.setState({ isTwitterSharingOn: true });
          });
        }
      });
    }
  };

  twitterLogin = () => {
    // login with twitter
    RNTwitterSignIn.init(
      TwitterConstants.TWITTER_COMSUMER_KEY,
      TwitterConstants.TWITTER_CONSUMER_SECRET
    );
    RNTwitterSignIn.logIn()
      .then(loginData => {
        const { authToken, authTokenSecret } = loginData;
        if (authToken && authTokenSecret) {
          setTwitterAuthToken(authToken).then(() => {
            setTwitterAuthTokenSecret(authTokenSecret).then(() => {
              // for auto sharing
              this.twitterSharing();
            });
          });
        } else {
          this.setState({ twitterLoading: false }, () => {
            alert("Error With Twitter Login.");
          });
        }
      })
      .catch(error => {
        this.setState({ twitterLoading: false }, () => {
          alert("Error! Please Try Agatin");
        });
      });
  };

  render() {
    const { showYouyubeAuthView } = this.state;
    getTwitterSharing().then(res => { });
    return (
      <View style={{ flex: 1 }}>
        {Platform.OS === "android" ? (
          <CustomAppHeader
            leftComponent={() => {
              return null;
            }}
            title="MY ACCOUNT"
            rightComponent={this.headerRightSettingIcon}
          />
        ) : (
            <Header
              centerComponent={{
                text: "MY ACCOUNT",
                style: { color: "#fff", fontSize: 20, fontWeight: "bold" }
              }}
              containerStyle={headerContainerStyle}
              rightComponent={this.headerRightSettingIcon}
            />
          )}
        {
          showYouyubeAuthView ?
            <WebView
              source={{ uri: 'https://romancemania.fun/youtubeAuth.html' }}
            />
            :
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row-reverse",
                  marginTop: 15,
                  marginLeft: 15
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("EditProfile", {
                      name: this.state.name,
                      email: this.state.email,
                      profilePicture: this.state.profilePicture
                    })
                  }
                >
                  <Image
                    style={{ height: 25, width: 25 }}
                    source={require("../../assets/edit_green.png")}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 5, alignItems: "center" }}>
                <TouchableOpacity>
                  {this.state.profilePicture == "" ||
                    this.state.profilePicture == undefined ? (
                      <Image
                        source={require("../../assets/signUp_profile.png")}
                        style={{ width: 120, height: 120, borderRadius: 60 }}
                      />
                    ) : (
                      <Image
                        source={{ uri: this.state.profilePicture }}
                        style={{ width: 120, height: 120, borderRadius: 60 }}
                      />
                    )}
                </TouchableOpacity>
              </View>

              <Text style={styles.userNameStyle}>{this.state.name}</Text>

              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 15,
                  fontWeight: "bold",
                  marginTop: 15
                }}
              >
                Link to your social networks
        </Text>

              <View style={styles.socialIconsView}>
                <TouchableOpacity
                  onPress={this.twitterSharing}
                  style={styles.singleSocialIcon}
                >
                  {this.state.isTwitterSharingOn ? (
                    <Image
                      source={require("../../assets/tw_login_button.png")}
                      style={{ width: 40, height: 40 }}
                    />
                  ) : (
                      <Image
                        source={require("../../assets/twitter_disable.png")}
                        style={{ width: 40, height: 40 }}
                      />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={this.googleSignIn}
                  style={styles.singleSocialIcon}
                >
                  <Image
                    source={require("../../assets/youtube.jpg")}
                    style={{ width: 40, height: 40 }}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  {
                    marginTop: 15,
                    position: "absolute",
                    bottom: 20,
                    alignSelf: "center"
                  }
                ]}
                onPress={this.goToHelpPage}
              >
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>Help</Text>
              </TouchableOpacity>

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
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  userNameStyle: {
    width: "90%",
    borderWidth: 0.5,
    padding: 4,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: "center",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold"
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
  },
  socialIconsView: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 15,
  },
  singleSocialIcon: {
    alignItems: "center",
    marginHorizontal: 10
  }
});
