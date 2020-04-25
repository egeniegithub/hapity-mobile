import React from "react";
import { Image } from "react-native";
import {
  createStackNavigator,
  createAppContainer,
  createBottomTabNavigator
} from "react-navigation";
import Login from "./src/Login/Login";
import RegisterNow from "./src/Login/RegisterNow";
import History from "./src/Dashboards/History";
import UploadBroadcast from "./src/Dashboards/UploadBroadcast";
import MyAccount from "./src/Dashboards/MyAccount";
import HistorySelection from "./src/History/HistorySelection";
import SearchBroadcast from "./src/History/SearchBroadcast";
import EditProfile from "./src/MyAccount/EditProfile";
import Settings from "./src/MyAccount/Settings";
import VideoDetail from "./src/History/VideoDetail";
import ShareStory from "./src/Login/ShareStory";
import Connect from "./src/Login/Connect";
import Splash from "./src/Login/Splash";
import TestHome from "./src/TestHome";
import EditBroadcast from "./src/History/EditBroadcast";
import VideoPlay from "./src/History/VideoPlay";
import LiveStreaming from "./src/streaming/LiveStreaming";

const colors = require("./src/Theme/Color");

const tabNavigator = createBottomTabNavigator(
  {
    History: {
      screen: History,
      navigationOptions: {
        tabBarLabel: " ",
        tabBarIcon: ({ tintColor }) =>
          tintColor == "green" ? (
            <Image
              source={require("./assets/history_movie_green.png")}
              style={{ width: 30, height: 30 }}
            />
          ) : (
            <Image
              source={require("./assets/history_movie_white.png")}
              style={{ width: 30, height: 30 }}
            />
          )
      }
    },
    UploadBroadcast: {
      screen: UploadBroadcast,
      navigationOptions: {
        tabBarLabel: " ",
        tabBarIcon: ({ tintColor }) =>
          tintColor == "green" ? (
            <Image
              source={require("./assets/ic_upload_green.png")}
              style={{ width: 30, height: 30 }}
            />
          ) : (
            <Image
              source={require("./assets/ic_upload_white.png")}
              style={{ width: 30, height: 30 }}
            />
          )
      }
    },
    MyAccount: {
      screen: MyAccount,
      navigationOptions: {
        tabBarLabel: " ",
        tabBarIcon: ({ tintColor }) =>
          tintColor == "green" ? (
            <Image
              source={require("./assets/profile_nav_bar_green.png")}
              style={{ width: 30, height: 30 }}
            />
          ) : (
            <Image
              source={require("./assets/profile_nav_bar_white.png")}
              style={{ width: 30, height: 30 }}
            />
          )
      }
    }
  },
  {
    initialRouteName: "History",
    defaultNavigationOptions: {
      tabBarVisible: true
    },
    tabBarOptions: {
      activeTintColor: "green",
      inactiveTintColor: "white",
      style: {
        backgroundColor: colors.colorPrimary
      },
      showLabel: false
    }
  }
);

// export default createAppContainer(tabNavigator)

// we have to write this blow becoz tabNavigator will show error.
const AppNavigator = createStackNavigator(
  {
    TestHome: {
      screen: TestHome
    },
    Splash: {
      screen: Splash
    },
    Login: {
      screen: Login
    },
    RegisterNow: {
      screen: RegisterNow
    },
    ShareStory: {
      screen: ShareStory
    },
    Connect: {
      screen: Connect
    },
    HistorySelection: {
      screen: HistorySelection
    },
    SearchBroadcast: {
      screen: SearchBroadcast
    },
    VideoPlay: {
      screen: VideoPlay
    },
    EditBroadcast: {
      screen: EditBroadcast
    },
    EditProfile: {
      screen: EditProfile
    },
    Settings: {
      screen: Settings
    },
    VideoDetail: {
      screen: VideoDetail
    },
    LiveStreaming: {
      screen: LiveStreaming
    },
    History: tabNavigator
  },
  {
    initialRouteName: "Splash",
    defaultNavigationOptions: {
      header: null
    }
  }
);

export default createAppContainer(AppNavigator);
