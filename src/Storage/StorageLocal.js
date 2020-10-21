import React from "react";
import AsyncStorage from "@react-native-community/async-storage";

const allKeys = [
  "login",
  "isSenstive",
  "informMe",
  "autoBroadcast",
  "videoDownloadLocally",
  "twitterAuthToken",
  "twitterSharing",
  "twitterAuthTokenSecret",
  "listOfBroadcastToDownload",
  "youtubeSharing",
  "youtubeRefreshToken",
];

// ISFrontCamera Credential
export const setFrontCamera = async data => {
  try {
    await AsyncStorage.setItem("frontCamera", data);
  } catch (e) {}
};

export const getFrontCamera = async () => {
  try {
    const value = await AsyncStorage.getItem("frontCamera");
    if (value !== null) {
      let obj = JSON.parse(value);
      return obj;
    } else {
      return null;
    }
  } catch (e) {}
};

// Broadcast to Downloads
export const setListOfBroadcastToDownload = async data => {
  try {
    await AsyncStorage.setItem("listOfBroadcastToDownload", data);
  } catch (e) {}
};

export const getListOfBroadcastToDownload = async () => {
  try {
    const value = await AsyncStorage.getItem("listOfBroadcastToDownload");
    if (value !== null) {
      let obj = JSON.parse(value);
      return obj;
    } else {
      return null;
    }
  } catch (e) {}
};

// Login Credential
export const setLoginSL = async data => {
  try {
    await AsyncStorage.setItem("login", data);
  } catch (e) {}
};

export const getLoginSL = async () => {
  try {
    const value = await AsyncStorage.getItem("login");
    if (value !== null) {
      let obj = JSON.parse(value);
      return obj;
    } else {
      return null;
    }
  } catch (e) {}
};

export const removeLoginUser = async () => {
  try {
    await AsyncStorage.removeItem("login");
  } catch (e) {}
};

// for First time install App
export const setIsFirstInstall = async data => {
  try {
    await AsyncStorage.setItem("isFirstInstall", data);
  } catch (e) {}
};

export const getIsFirstInstall = async () => {
  try {
    const value = await AsyncStorage.getItem("isFirstInstall");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

// Setting Variables

export const setIsSenstive = async data => {
  try {
    await AsyncStorage.setItem("isSenstive", data);
  } catch (e) {}
};

export const getIsSensitive = async () => {
  try {
    const value = await AsyncStorage.getItem("isSenstive");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

export const setInformMe = async data => {
  try {
    await AsyncStorage.setItem("informMe", data);
  } catch (e) {}
};

export const getInformMe = async () => {
  try {
    const value = await AsyncStorage.getItem("informMe");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

export const setAutoBroadcast = async data => {
  try {
    await AsyncStorage.setItem("autoBroadcast", data);
  } catch (e) {}
};

export const getAutoBroadcast = async () => {
  try {
    const value = await AsyncStorage.getItem("autoBroadcast");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

export const setVideoDownloadLocally = async data => {
  try {
    await AsyncStorage.setItem("videoDownloadLocally", data);
  } catch (e) {}
};

export const getVideoDownloadLocally = async () => {
  try {
    const value = await AsyncStorage.getItem("videoDownloadLocally");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

// store twitter auth token

export const setTwitterAuthToken = async data => {
  try {
    await AsyncStorage.setItem("twitterAuthToken", data);
  } catch (e) {}
};

export const getTwitterAuthToken = async () => {
  try {
    const value = await AsyncStorage.getItem("twitterAuthToken");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

// store twitter auth token Secret

export const setTwitterAuthTokenSecret = async data => {
  try {
    await AsyncStorage.setItem("twitterAuthTokenSecret", data);
  } catch (e) {}
};

export const getTwitterAuthTokenSecret = async () => {
  try {
    const value = await AsyncStorage.getItem("twitterAuthTokenSecret");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

// twitter sharing

export const setTwitterSharing = async data => {
  try {
    await AsyncStorage.setItem("twitterSharing", data);
  } catch (e) {}
};

export const getTwitterSharing = async () => {
  try {
    const value = await AsyncStorage.getItem("twitterSharing");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};

// youtube sharing

export const setYoutubeSharing = async data => {
  try {
    await AsyncStorage.setItem("youtubeSharing", data);
  } catch (e) {}
};

export const getYoutubeSharing = async () => {
  try {
    const value = await AsyncStorage.getItem("youtubeSharing");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
}

// youtube Refresh Token

export const setYoutubeRefreshToken = async data => {
  try {
    await AsyncStorage.setItem("youtubeRefreshToken", data);
  } catch (e) {}
}

export const getYoutubeRefreshToken = async () => {
  try {
    const value = await AsyncStorage.getItem("youtubeRefreshToken");
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {}
};


// remove Storage Data

export const removeAllStorageData = async () => {
  const keysLength = allKeys.length;
  for (i = 0; i < keysLength; i++) {
    await AsyncStorage.removeItem(allKeys[i]);
  }

  const value = await AsyncStorage.getItem(allKeys[keysLength - 1]);
  if (value !== null) {
    return false;
  } else {
    return true;
  }
};
