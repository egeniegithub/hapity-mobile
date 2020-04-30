import React from "react";
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { Header, Icon, Input } from "react-native-elements";
// import BroadcastView from "react-native-wowza-gocoder";
import ImagePicker from "react-native-image-picker";
import {
  headerContainerStyle,
  imageOptions,
  TwitterConstants
} from "../Config/Constants";
import Geolocation from "react-native-geolocation-service";
import {
  startBroadcastUrl,
  stopBroadcast,
  timeStampBroadcastUrl
} from "../Network/Network";
import { ProgressDialog } from "react-native-simple-dialogs";
import {
  getAutoBroadcast,
  getFrontCamera,
  getIsSensitive,
  getListOfBroadcastToDownload,
  getLoginSL,
  getTwitterAuthToken,
  getTwitterSharing,
  setFrontCamera,
  setListOfBroadcastToDownload,
  setTwitterAuthToken,
  setTwitterAuthTokenSecret,
  setTwitterSharing
} from "../Storage/StorageLocal";
import { broadcastShareOnTwitter, streamName, deviceMetaInfo } from "../Config/Function";
import {
  NavigationActions,
  StackActions,
  withNavigationFocus
} from "react-navigation";
import {
  permissionCheck,
  permissionRequest
} from "../Permissions/AndroidPermission";
import { checkMultiple, PERMISSIONS, request, openSettings } from 'react-native-permissions';
import AndroidOpenSettings from "react-native-android-open-settings";
import BroadcastTimer from "../Components/BroadcastTimer";
import BroadcastLiveIcon from "../Components/BroadcastLiveIcon";
import StartBroadcastCountDown from "../Components/StartBroadcastCountDown";
import KeepAwake from "react-native-keep-awake";
import CameraScreen from "./CameraScreen";
import CustomAppHeader from "../Components/CustomAppHeader";
import * as colors from "../Theme/Color";
import AntMediaLib5 from 'react-native-ant-media-lib5';

const { RNTwitterSignIn } = NativeModules;
var BroadcastManager = NativeModules.BroadcastModule;

class LiveStreaming extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      titleBroadcast: "",
      startBroadcasting: false,
      isFrontCamera: false,
      isFlashOn: false,
      isImageSelected: false,
      isLocationOn: false,
      startBroadcastDialog: false,
      broadcastStreamName: "",
      location: "0,0",
      isSensitive: "NO",
      cameraPermission: false,
      microPhonePermission: false,
      enablePermission: false,
      keyboardNotOpen: true,
      isTwitterSharingOn: false,
      stopBroadcastAndGoToHistory: false, // bcz of some state err while login with twitter..
      broadcastStartOnFirstLaunch: false,
      broadcastRuning: false,
      image: "",
      broadcastID: "",
      getPhoto: false,
      secondAttempt: false,
      isWozaFrontCamera: false,
      switchCamera: false,
      videoSizePreset: 1,
      metaInfo: {},
      isAntMediaFrontCamera: false,
    };
  }

  componentDidMount() {
    if (Platform.OS == "android") {
      this.androidPermission();
      this.keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        this._keyboardDidHide
      );
      this.keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        this._keyboardDidShow
      );
      this.backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        this.handleBackPress
      );
      // getFrontCamera().then(res => {
      //   this.setState({
      //     isFrontCamera: JSON.parse(res)
      //   });
      // });
    } else {
      this.iosPermission();
    }
    getTwitterSharing().then(res => {
      this.setState({ isTwitterSharingOn: JSON.parse(res) });
    });
    // const { navigation } = this.props;
    // const firstLaunch = navigation.getParam("firstLaunch");
    // if (firstLaunch === undefined || firstLaunch === true) {
    //   this.setState({
    //     broadcastStartOnFirstLaunch: true
    //   });
    // }
    getAutoBroadcast().then(res => {
      this.setState({
        broadcastStartOnFirstLaunch: JSON.parse(res)
      });
      // if (JSON.parse(res)) {
      //   const resetAction = StackActions.reset({
      //     index: 0,
      //     actions: [
      //       NavigationActions.navigate({ routeName: "LiveStreaming" })
      //     ]
      //   });
      //   this.props.navigation.dispatch(resetAction);
      // } else {
      //   const resetAction = StackActions.reset({
      //     index: 0,
      //     actions: [
      //       NavigationActions.navigate({ routeName: "History" })
      //     ]
      //   });
      //   this.props.navigation.dispatch(resetAction);
      // }
    });
    deviceMetaInfo().then(res => {
      this.setState({
        metaInfo: res
      });
    });
  }

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

  _keyboardDidHide = () => {
    this.setState({
      keyboardNotOpen: true
    });
  };

  _keyboardDidShow = () => {
    this.setState({
      keyboardNotOpen: false
    });
  };

  handleBackPress = () => {
    const { navigation } = this.props;
    const firstLaunch = navigation.getParam("firstLaunch");
    if (!this.state.startBroadcasting) {
      if (firstLaunch === undefined || firstLaunch === true) {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "History" })]
        });
        this.props.navigation.dispatch(resetAction);
        return true;
      } else {
        this.props.navigation.goBack();
        return true;
      }
    } else {
      this.stopBroadcast();
      return true;
    }
  };

  iosPermission = () => {
    checkMultiple([PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE]).then(response => {
      if (
        response[PERMISSIONS.IOS.CAMERA] == "granted" &&
        response[PERMISSIONS.IOS.MICROPHONE] == "granted"
      ) {
        this.setState({
          cameraPermission: true,
          microPhonePermission: true
        });
      } else if (response[PERMISSIONS.IOS.CAMERA] == "denied") {
        // first time for both permission
        request(PERMISSIONS.IOS.CAMERA).then(response => {
          if (response == "granted") {
            this.setState({ cameraPermission: true }, () => {
              if (response[PERMISSIONS.IOS.MICROPHONE] == "denied") {
                request(PERMISSIONS.IOS.MICROPHONE).then(response => {
                  if (response == "granted") {
                    this.setState({
                      microPhonePermission: true,
                      enablePermission: true
                    });
                  }
                });
              }
            });
          } else {
            this.setState({
              enablePermission: true
            });
          }
        });
      }
      if (response[PERMISSIONS.IOS.MICROPHONE] == "denied") {
        request(PERMISSIONS.IOS.MICROPHONE).then(response => {
          if (response == "granted") {
            this.setState({
              microPhonePermission: true,
              enablePermission: true
            });
          } else {
            this.setState({
              enablePermission: true
            });
          }
        });
      } else {
        this.setState({
          enablePermission: true
        });
      }
    });
  };

  androidPermission = () => {
    permissionCheck(PermissionsAndroid.PERMISSIONS.CAMERA).then(res => {
      this.setState(
        {
          cameraPermission: res
        },
        () => {
          if (!this.state.cameraPermission) {
            permissionRequest(PermissionsAndroid.PERMISSIONS.CAMERA).then(
              res => {
                this.setState(
                  {
                    cameraPermission: res
                  },
                  () => {
                    // Next permission
                    permissionCheck(
                      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
                    ).then(res => {
                      this.setState(
                        {
                          microPhonePermission: res
                        },
                        () => {
                          if (!this.state.microPhonePermission) {
                            permissionRequest(
                              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
                            ).then(res => {
                              this.setState({
                                microPhonePermission: res,
                                enablePermission: true
                              });
                            });
                          }
                        }
                      );
                    });
                  }
                );
              }
            );
          }
        }
      );
    });
  };

  goToDevicePErmissionSetting = () => {
    if (Platform.OS == "android") {
      AndroidOpenSettings.appDetailsSettings();
    } else {
      openSettings().catch(() => { });
    }
  };

  leftArrowGoBack = () => {
    const { navigation } = this.props;
    const firstLaunch = navigation.getParam("firstLaunch");
    if (!this.state.startBroadcasting) {
      if (firstLaunch === undefined || firstLaunch === true) {
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
      } else {
        return (
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
          >
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../assets/back_arrow.png")}
            />
          </TouchableOpacity>
        );
      }
    } else {
      return null;
    }
  };

  onBroadcastStop = async () => {
    let data = await getListOfBroadcastToDownload();
    if (data === null || data === undefined) {
      let singleData = [];
      singleData.push(this.state.broadcastStreamName);
      await setListOfBroadcastToDownload(JSON.stringify(singleData));
    } else {
      data.push(this.state.broadcastStreamName);
      await setListOfBroadcastToDownload(JSON.stringify(data));
    }

    if (Platform.OS === "android") {
      BroadcastManager.stopTimer();
    }
    if (this.state.stopBroadcastAndGoToHistory) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "History" })]
      });
      this.props.navigation.dispatch(resetAction);
    }
  };

  _pickImage = () => {
    if (this.state.startBroadcasting) {
      return;
    }
    ImagePicker.showImagePicker(imageOptions, response => {
      if (response.error) {
        alert(response.error);
      } else {
        const source = response.data;
        this.setState({
          isImageSelected: true,
          image: source
        });
      }
    });
  };

  setCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let currentLocation = latitude + "," + longitude;
        this.setState({
          location: currentLocation
        });
      },
      error => {
        // See error code charts below.
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    this.setState({ isLocationOn: true });
  };

  requestLocationPermission = async () => {
    // if (this.state.startBroadcasting) {
    //   return;
    // }
    // if (Platform.OS === "ios") {
    //   Permissions.check("location").then(res => {
    //     if (res == "undetermined") {
    //       Permissions.request("location").then(response => {
    //         if (response == "authorized") {
    //           this.setCurrentLocation();
    //         }
    //       });
    //     } else if (res == "authorized") {
    //       this.setCurrentLocation();
    //     } else {
    //       Permissions.openSettings();
    //     }
    //   });
    // } else {
    //   let granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //     {
    //       title: "App Geolocation Permission",
    //       message: "App needs access to your phone's location."
    //     }
    //   );

    //   if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //     this.setCurrentLocation();
    //   } else {
    //   }
    // }
  };

  broadcastStart = () => {
    this.setState(
      {
        startBroadcastDialog: true,
        broadcastStreamName: streamName(),
        broadcastStartOnFirstLaunch: false
      },
      () => {
        getIsSensitive().then(res => {
          let isSensitive = "NO";
          if (JSON.parse(res)) {
            isSensitive = "YES"
          }
          getLoginSL().then(res => {
            let postPlugin = "NO";
            if (res.user_info.auth_key != "") {
              postPlugin = "YES";
            }
            startBroadcastUrl(
              res.user_info.user_id,
              res.user_info.token,
              this.state.titleBroadcast,
              this.state.location,
              isSensitive,
              postPlugin,
              this.state.broadcastStreamName,
              this.state.image,
              this.state.metaInfo,
              result => {
                console.log('startBroadcastUrl : ', result);
                if (result.status === "error") {
                  this.setState({ startBroadcastDialog: false }, () => {
                    setTimeout(() => {
                      Alert.alert("Alert", result.message, [
                        {
                          text: "OK",
                          onPress: () => {
                            const resetAction = StackActions.reset({
                              index: 0,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: "History"
                                })
                              ]
                            });
                            this.props.navigation.dispatch(resetAction);
                          }
                        }
                      ]);
                    }, 100);
                  });
                }
                else if (result.response.status === "success") {
                  if (Platform.OS == "android") {
                    this.setState(
                      {
                        startBroadcasting: true,
                        broadcastID: result.response.broadcast_id
                      },
                      () => {
                        setTimeout(() => {
                          this.setState({
                            broadcastRuning: true,
                            startBroadcastDialog: false
                          }, () => {
                            this.getBroadCastView()
                          });

                        }, 100);
                      }
                    );
                  } else {
                    this.setState(
                      {
                        startBroadcastDialog: false,
                        startBroadcasting: true,
                        broadcastID: result.response.broadcast_id
                      },
                      () => {
                        setTimeout(() => {
                          this.setState({
                            broadcastRuning: true
                          });
                        }, 200);
                      }
                    );
                  }
                  if (this.state.isTwitterSharingOn) {
                    let twitterShareUrl = result.response.share_url;
                    twitterShareUrl = twitterShareUrl.replace("https://", "");
                    twitterShareUrl = twitterShareUrl.replace("http://", "");
                    twitterShareUrl = twitterShareUrl.replace(/\//g, "%2F");
                    broadcastShareOnTwitter(twitterShareUrl);
                  }
                  this.timeStampInterval = setInterval(() => {
                    timeStampBroadcastUrl(
                      res.user_info.token,
                      result.response.broadcast_id,
                      hitResult => { }
                    );
                  }, 60000);
                }
              }
            );
          });
        });
      }
    );
  };

  stopBroadcast = () => {
    Alert.alert(
      "Stop Broadcast",
      "Are you sure you want to stop this broadcast?",
      [
        {
          text: "Yes",
          onPress: () => {
            getLoginSL().then(res => {
              stopBroadcast(
                res.user_info.token,
                this.state.broadcastID,
                result => {
                  console.log('stopBroadcast : ', result);
                }
              );
              this.setState({
                broadcastRuning: false,
                stopBroadcastAndGoToHistory: true
              });
            });
          }
        },
        { text: "No" }
      ]
    );
  };

  componentWillUnmount() {
    if (Platform.OS == "android") {
      this.keyboardDidHideListener.remove();
      this.keyboardDidShowListener.remove();
      this.backHandler.remove();
    }
    clearInterval(this.timeStampInterval);
  }



  getBroadCastView = () => {
    const { keyboardNotOpen, broadcastStreamName, isAntMediaFrontCamera } = this.state;
    if (keyboardNotOpen) {
      AntMediaLib5.startLiveStream(broadcastStreamName, isAntMediaFrontCamera)
    }
  };

  startBroacastOnLaunch = value => {
    if (value && !this.state.secondAttempt) {
      this.RNCameraView.takePicture();
    }
  };

  getSnapShot = data => {
    if (Platform.OS == "android" && this.state.isFrontCamera) {
      if (data) {
        this.setState(
          {
            image: data,
            secondAttempt: true,
            isFrontCamera: false, // for android front camera video stratch
            switchCamera: true
          },
          () => {
            setTimeout(() => {
              this.broadcastStart();
            }, 200);
          }
        );
      } else {
        this.setState(
          {
            isFrontCamera: false,
            switchCamera: true
          },
          () => {
            setTimeout(() => {
              this.broadcastStart();
            }, 200);
          }
        );
      }
    } else {
      if (data) {
        this.setState(
          {
            image: data,
            secondAttempt: true
          },
          () => {
            this.broadcastStart();
          }
        );
      } else {
        this.broadcastStart();
      }
    }
  };

  enBroadcast = () => {
    getLoginSL().then(res => {
      stopBroadcast(
        res.user_info.token,
        this.state.broadcastID,
        result => {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "History" })]
          });
          this.props.navigation.dispatch(resetAction);
        }
      );
    });
  }

  render() {
    const { startBroadcasting } = this.state;
    let timeForKeyboard = 0;
    if (!this.state.keyboardNotOpen) {
      timeForKeyboard = 2000;
    }
    if (this.state.cameraPermission && this.state.microPhonePermission) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.colorDarkGray }}>
          <KeepAwake />
          {!startBroadcasting && (
            <CameraScreen
              ref={ref => {
                this.RNCameraView = ref;
              }}
              isFrontCamera={this.state.isFrontCamera}
              getSnapShot={this.getSnapShot}
              keyboardNotOpen={this.state.keyboardNotOpen}
            />)}
          {startBroadcasting && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <BroadcastTimer enBroadcast={this.enBroadcast} />
              <ActivityIndicator
                size="large"
                color={colors.colorPrimary}
              />
            </View>
          )}
          <View
            style={[
              { backgroundColor: "rgba(150,150,150,0.00001)" },
              styles.videoContainer1
            ]}
          >
            {Platform.OS === "android" ? (
              <CustomAppHeader
                leftComponent={this.leftArrowGoBack}
                title="Live Stream"
                rightComponent={() => {
                  return null;
                }}
              />
            ) : (
                <Header
                  centerComponent={{
                    text: "Live Stream",
                    style: { color: "#fff", fontSize: 18, fontWeight: "bold" }
                  }}
                  containerStyle={headerContainerStyle}
                  leftComponent={this.leftArrowGoBack}
                />
              )}

            <ProgressDialog
              visible={this.state.startBroadcastDialog}
              title="Starting Broadcast"
              message="Please, wait..."
            />
            <View style={styles.container}>
              {!this.state.startBroadcasting ? (
                <Input
                  placeholder="Enter Broadcast Title Here"
                  inputContainerStyle={{
                    borderBottomWidth: 0,
                    backgroundColor: colors.colorWhite,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingRight: 8,
                    paddingLeft: 8,
                    marginTop: 8,
                    height: 50
                  }}
                  value={this.state.titleBroadcast}
                  onChangeText={text => this.setState({ titleBroadcast: text })}
                />
              ) : null}

              {!startBroadcasting && (
                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={this.twitterSharing}
                    style={{ marginTop: 4, padding: 8 }}
                  >
                    {this.state.isTwitterSharingOn ? (
                      <Image
                        source={require("../../assets/tw_login_button.png")}
                        style={{ width: 30, height: 30 }}
                      />
                    ) : (
                        <Image
                          source={require("../../assets/twitter_disable.png")}
                          style={{ width: 30, height: 30 }}
                        />
                      )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimeout(() => {
                        if (
                          this.state.isFrontCamera &&
                          Platform.OS == "android"
                        ) {
                          if (!this.state.isImageSelected) {
                            this.setState(
                              {
                                startBroadcastDialog: true
                              },
                              () => {
                                this.RNCameraView.takePicture();
                              }
                            );
                          } else {
                            this.setState(
                              {
                                isFrontCamera: false,
                                switchCamera: true
                              },
                              () => {
                                setTimeout(() => {
                                  this.broadcastStart();
                                }, 200);
                              }
                            );
                          }
                        } else {
                          if (!this.state.isImageSelected) {
                            this.setState(
                              {
                                startBroadcastDialog: true
                              },
                              () => {
                                this.RNCameraView.takePicture();
                              }
                            );
                          } else {
                            this.broadcastStart();
                          }
                        }
                      }, timeForKeyboard);
                    }}
                    style={{ marginTop: 4, padding: 4 }}
                  >
                    <Image
                      style={{ width: 60, height: 60 }}
                      source={require("../../assets/record_green.png")}
                    />
                  </TouchableOpacity>
                  {this.state.broadcastStartOnFirstLaunch ? (
                    <StartBroadcastCountDown
                      startBroacastOnLaunch={this.startBroacastOnLaunch}
                    />
                  ) : null}
                </View>
              )}
              {!startBroadcasting && (
                <View style={styles.buttonsRightViewStyle}>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState(
                        {
                          isFrontCamera: !this.state.isFrontCamera,
                          isFlashOn: false,
                          isAntMediaFrontCamera: !this.state.isAntMediaFrontCamera
                        },
                        () => {
                          // if (Platform.OS === "android") {
                          // if (this.state.broadcastRuning) {
                          //   if (this.state.isWozaFrontCamera) {
                          //     setFrontCamera(
                          //       JSON.stringify(this.state.isFrontCamera)
                          //     ).then(() => {
                          //       // android black screen issue when again start and switch camera
                          //     });
                          //   } else {
                          //     setFrontCamera(
                          //       JSON.stringify(this.state.isFrontCamera)
                          //     ).then(() => { });
                          //   }
                          // } else {
                          //   setFrontCamera(
                          //     JSON.stringify(this.state.isFrontCamera)
                          //   ).then(() => { });
                          // }
                          // }
                        }
                      );
                    }}
                    style={{ marginTop: 4, padding: 4 }}
                  >
                    <Image
                      style={{ width: 40, height: 40 }}
                      source={require("../../assets/camera_switch.png")}
                    />
                  </TouchableOpacity>

                  {this.state.isFlashOn ? (
                    <TouchableOpacity
                      onPress={() => this.setState({ isFlashOn: false })}
                      style={{ marginTop: 4, padding: 4 }}
                    >
                      <Image
                        style={{ width: 40, height: 40 }}
                        source={require("../../assets/flash_on.png")}
                      />
                    </TouchableOpacity>
                  ) : (
                      <TouchableOpacity
                        onPress={() => this.setState({ isFlashOn: true })}
                        style={{ marginTop: 4, padding: 4 }}
                      >
                        <Image
                          style={{ width: 40, height: 40 }}
                          source={require("../../assets/flash_off.png")}
                        />
                      </TouchableOpacity>
                    )}

                  {this.state.isImageSelected ? (
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          isImageSelected: false
                        });
                      }}
                      style={{ marginTop: 4, padding: 4 }}
                    >
                      <Image
                        style={{ width: 40, height: 40 }}
                        source={require("../../assets/gallery.png")}
                      />
                    </TouchableOpacity>
                  ) : (
                      <TouchableOpacity
                        onPress={this._pickImage}
                        style={{ marginTop: 4, padding: 4 }}
                      >
                        <Image
                          style={{ width: 40, height: 40, opacity: 0.2 }}
                          source={require("../../assets/gallery.png")}
                        />
                      </TouchableOpacity>
                    )}

                  {this.state.isLocationOn ? (
                    <TouchableOpacity
                      onPress={() => this.setState({ isLocationOn: false })}
                      style={{ marginTop: 4, padding: 4 }}
                    >
                      <Image
                        style={{ width: 40, height: 40 }}
                        source={require("../../assets/location.png")}
                      />
                    </TouchableOpacity>
                  ) : (
                      <TouchableOpacity
                        onPress={this.requestLocationPermission}
                        style={{ marginTop: 4, padding: 4 }}
                      >
                        <Image
                          style={{ width: 40, height: 40, opacity: 0.2 }}
                          source={require("../../assets/location.png")}
                        />
                      </TouchableOpacity>
                    )}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    } else {
      if (this.state.enablePermission) {
        return (
          <View style={{ flex: 1 }}>
            {Platform.OS === "android" ? (
              <CustomAppHeader
                leftComponent={this.leftArrowGoBack}
                title="Live Stream"
                rightComponent={() => {
                  return null;
                }}
              />
            ) : (
                <Header
                  centerComponent={{
                    text: "Live Stream",
                    style: { color: "#fff", fontSize: 18, fontWeight: "bold" }
                  }}
                  containerStyle={headerContainerStyle}
                  leftComponent={this.leftArrowGoBack}
                />
              )}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                Enable Camera And MicroPhone Permissions
              </Text>
              <Icon
                name="settings"
                color={colors.colorBlack}
                containerStyle={{ marginTop: 8 }}
                size={30}
                onPress={this.goToDevicePErmissionSetting}
              />
            </View>
          </View>
        );
      } else {
        return null;
      }
    }
  }
}

export default withNavigationFocus(LiveStreaming);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  videoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  buttonsRightViewStyle: {
    width: 55,
    backgroundColor: colors.colorPrimaryDark,
    position: "absolute",
    bottom: 50,
    right: 20,
    alignItems: "center"
  },
  videoContainer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
