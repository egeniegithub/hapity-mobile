import React from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  NativeModules,
  ActivityIndicator,
  Platform
} from "react-native";
import Statusbar from "../Components/Statusbar";
import { Input, Button, Icon } from "react-native-elements";
import SocialLogin from "../Components/SocialLogin";
import {
  doLogin,
  loginWithTwitter,
  loginWithFaceBook
} from "../Network/Network";
import { TwitterConstants } from "../Config/Constants";
import { StackActions, NavigationActions } from "react-navigation";
import {
  setLoginSL,
  setTwitterAuthToken,
  setAutoBroadcast,
  setTwitterAuthTokenSecret,
  getAutoBroadcast
} from "../Storage/StorageLocal";
import {
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager
} from "react-native-fbsdk";
import { deviceMetaInfo } from '../Config/Function';
const { RNTwitterSignIn } = NativeModules;

const colors = require("../../src/Theme/Color");

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      email: "",
      password: "",
      twitterLoading: false,
      fbLoading: false,
      icEye: "visibility-off",
      isPassword: true,
      metaInfo: {},
    };
  }

  componentDidMount () {
    NativeModules.LiveStream.startLiveStream();
    deviceMetaInfo().then(res => {
      this.setState({
        metaInfo: res
      });
    });
  }

  changePwdType = () => {
    const { isPassword } = this.state;
    this.setState({
      icEye: isPassword ? "visibility" : "visibility-off",
      isPassword: !isPassword
    });
  };

  _tryLogin = () => {
    this.setState({ dialogVisible: true });
    doLogin(this.state.email, this.state.password, this.state.metaInfo, result => {
      if (result.status == "success") {
        this.setState({ dialogVisible: false }, () => {
          // this.props.navigation.navigate("History");
          setLoginSL(JSON.stringify(result)).then(() => {
            setAutoBroadcast("false").then(() => {
              const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: "History" })]
              });
              this.props.navigation.dispatch(resetAction);
            });
          });
        });
      } else {
        this.setState({ dialogVisible: false }, () => {
          alert(result.message);
        });
      }
    });
  };

  _responseInfoCallback = (error, result) => {
    if (error) {
      this.setState({ fbLoading: false }, () => {
        alert("Error! Please Try again.");
      });
    } else {
      this.fbLoginWithServer(result);
    }
  };
  fbLoginWithServer = async result => {
    loginWithFaceBook(
      result.id,
      result.name,
      result.email,
      result.picture.data.url,
      result => {
        if (result.status == "success") {
          this.setState({ fbLoading: false }, () => {
            setLoginSL(JSON.stringify(result)).then(async () => {
              setAutoBroadcast("false").then(() => {
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({ routeName: "History" })
                  ]
                });
                this.props.navigation.dispatch(resetAction);
              });
            });
          });
        } else {
          this.setState({ fbLoading: false }, () => {
            alert(result.message);
          });
        }
      }
    );
  };

  facebookLogin = () => {
    LoginManager.logOut();

    let behavior = Platform.OS === "android" ? "WEB_ONLY" : "browser";
    setTimeout(() => {
      LoginManager.setLoginBehavior(behavior);
      LoginManager.logInWithPermissions(["public_profile", "email"]).then(
        result => {
          if (result.isCancelled) {
          } else {
            this.setState({ fbLoading: true });
            AccessToken.getCurrentAccessToken().then(data => {
              const infoRequest = new GraphRequest(
                "/me",
                {
                  accessToken: data.accessToken,
                  parameters: {
                    fields: {
                      string: "email,name,picture"
                    }
                  }
                },
                this._responseInfoCallback
              );

              new GraphRequestManager().addRequest(infoRequest).start();
            });
          }
        },
        function(error) {
          if (error == "Error: net::ERR_INTERNET_DISCONNECTED") {
            alert("No Internet Connection!");
          }
        }
      );
    }, 200);
  };

  loginWithTwitter = () => {
    RNTwitterSignIn.init(
      TwitterConstants.TWITTER_COMSUMER_KEY,
      TwitterConstants.TWITTER_CONSUMER_SECRET
    );
    RNTwitterSignIn.logIn()
      .then(loginData => {
        const {
          authToken,
          authTokenSecret,
          email,
          userID,
          userName,
          profile_picture
        } = loginData;
        if (email != "") {
          if (authToken && authTokenSecret) {
            this.setState({ twitterLoading: true });
            setTwitterAuthToken(authToken).then(() => {
              setTwitterAuthTokenSecret(authTokenSecret).then(() => {
                loginWithTwitter(
                  userID,
                  userName,
                  email,
                  profile_picture,
                  result => {
                    if (result.status == "success") {
                      this.setState({ twitterLoading: false }, () => {
                        setAutoBroadcast("false").then(() => {
                          setLoginSL(JSON.stringify(result)).then(() => {
                            const resetAction = StackActions.reset({
                              index: 0,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: "History"
                                })
                              ]
                            });
                            this.props.navigation.dispatch(resetAction);
                          });
                        });
                      });
                    } else {
                      this.setState({ twitterLoading: false }, () => {
                        alert(result.message);
                      });
                    }
                  }
                );
              });
            });
          } else {
            this.setState({ twitterLoading: false }, () => {
              alert("Error With Twitter Login.");
            });
          }
        } else {
          alert("Sorry! No Email Found With Twitter Account.");
        }
      })
      .catch(error => {
        this.setState({ twitterLoading: false }, () => {
          alert("Error! Please Try Agatin");
        });
      });
  };

  forgetPassword = () => {
    const url = "http://www.hapity.com/home/forget_password";
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error("An error occurred", err));
  };
  render() {
    return (
      // SafeAreView is for ios device and
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScrollView style={styles.mainContainer}>
          {/* Statusbar work normally in android but in ios it just disply barstyle white color */}
          <Statusbar />

          <View style={styles.imageContainer}>
            <Image
              style={{ width: 200, height: 70 }}
              source={require("../../assets/hapityText.png")}
            />
          </View>

          <View
            style={{
              height: 120,
              justifyContent: "space-around",
              alignItems: "center",
              marginTop: 20
            }}
          >
            <Input
              placeholder="Email or Username"
              containerStyle={styles.inputFieldStyle}
              inputContainerStyle={{ borderBottomWidth: 0 }}
              onChangeText={text => this.setState({ email: text })}
              autoCapitalize="none"
            />

            <Input
              placeholder="Password"
              containerStyle={styles.inputFieldStyle}
              inputContainerStyle={{ borderBottomWidth: 0 }}
              onChangeText={text => this.setState({ password: text })}
              secureTextEntry={this.state.isPassword}
              autoCapitalize="none"
              rightIcon={
                <Icon
                  name={this.state.icEye}
                  size={24}
                  color="black"
                  onPress={this.changePwdType}
                />
              }
            />
          </View>

          <View style={[styles.makeComponentCenter, { marginTop: 15 }]}>
            <Button
              disabled={this.state.dialogVisible}
              loading={this.state.dialogVisible}
              title="LOGIN"
              buttonStyle={{ backgroundColor: colors.colorpurple }}
              containerStyle={{ width: "90%" }}
              onPress={this._tryLogin}
            />
          </View>

          <TouchableOpacity
            style={styles.makeComponentCenter}
            onPress={this.forgetPassword}
          >
            <Text
              style={{
                padding: 10,
                fontSize: 20,
                fontWeight: "bold",
                color: "black"
              }}
            >
              Forgotton your password?
            </Text>
          </TouchableOpacity>

          <View style={styles.makeComponentCenter}>
            <Text style={styles.textOR}>OR</Text>
          </View>

          <SocialLogin
            text="Login with Facebook"
            icon={require("../../assets/fb_login_button.png")}
            bgColor={colors.colorFBButton}
            onClick={this.facebookLogin}
            loading={this.state.fbLoading}
          />

          <SocialLogin
            text="Login with Twitter"
            icon={require("../../assets/tw_login_button.png")}
            bgColor={colors.colorTwitterButton}
            onClick={this.loginWithTwitter}
            loading={this.state.twitterLoading}
          />

          <View style={[styles.makeComponentCenter, { marginTop: 10 }]}>
            <Text style={{ color: colors.colorWhite, fontWeight: "bold" }}>
              Don't have an account yet
            </Text>
          </View>

          <View style={[styles.makeComponentCenter, { marginTop: 10 }]}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("RegisterNow")}
            >
              <Text
                style={{
                  color: colors.colorBlack,
                  fontWeight: "bold",
                  fontSize: 20
                }}
              >
                Register Now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: colors.colorPrimary
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colorPrimary
  },
  imageContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  makeComponentCenter: {
    justifyContent: "center",
    alignItems: "center"
  },
  textOR: {
    color: colors.colorWhite,
    fontSize: 18
  },
  inputFieldStyle: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 5
  }
});
