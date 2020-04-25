import React from "react";
import { PermissionsAndroid } from "react-native";

export const permissionRequest = async innerName => {
  try {
    const granted = await PermissionsAndroid.request(innerName);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

export const permissionCheck = async innerName => {
  try {
    PermissionsAndroid.check(innerName).then(res => {
      return res;
    });
  } catch (err) {
    return false;
  }
};

export const requsetCameraPermissionAndroid = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    if (granted == "granted") {
      return true;
    } else if (granted == "denied") {
      return undefined; // because i don't want to show my custom permission check..
    } else if (granted == "never_ask_again") {
      return false;
    }
  } catch (err) {
    console.log("requsetLocationPermission Error: ", err);
  }
};
