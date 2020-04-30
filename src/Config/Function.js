import React from "react";
import { Platform } from 'react-native';
import {
  getTwitterAuthTokenSecret,
  getTwitterAuthToken,
  getListOfBroadcastToDownload,
  setListOfBroadcastToDownload,
} from "../Storage/StorageLocal";
import { videoDownload } from '../Network/Network';
import BackgroundTimer from 'react-native-background-timer';
import RNFetchBlob from 'rn-fetch-blob';
import DeviceInfo from 'react-native-device-info';
import NetInfo from "@react-native-community/netinfo";
import CameraRoll from "@react-native-community/cameraroll";

const downloadSizeInBits = 30000000;
const metric = 'MBps';

const OAuth = require("oauth-1.0a");
var CryptoJS = require("crypto-js");

export function emailRegex(email) {
  if (email.trim() === "") {
    return false;
  }
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return reg.test(email);
}

export const streamName = () => {
  let today = new Date();
  let time =
    today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
  let date = today.getFullYear() + "" + today.getMonth() + "" + today.getDate();
  let miliSecond = today.getMilliseconds();
  let stream = "stream_" + time + date + miliSecond

  return stream;
};

export const broadcastShareOnTwitter = tweet => {
  getTwitterAuthToken().then(resToken => {
    getTwitterAuthTokenSecret().then(resSecret => {
      const oauth = OAuth({
        consumer: {
          key: "f5NMQCZu98csQVvAQcygt3VtD",
          secret: "NpIUCB1NPHHp8DtuQTBHaSjInuh3CyHVK3yLmAL5sAZQqsQLmG"
        },
        signature_method: "HMAC-SHA1",
        hash_function(base_string, key) {
          return CryptoJS.HmacSHA1(base_string, key).toString(
            CryptoJS.enc.Base64
          );
        }
      });

      const request_data = {
        url: `https://api.twitter.com/1.1/statuses/update.json?status=${tweet}`,
        method: "POST",
        data: { status: "Live Video From Hapity" }
      };

      // Note: The token is optional for some requests
      const token = {
        key: resToken,
        secret: resSecret
      };

      let formData = new FormData();
      formData.append("status", "Hapity");
      let request = {
        method: "POST",
        headers: oauth.toHeader(oauth.authorize(request_data, token)),
        body: formData
      };
      fetch(request_data.url, request)
        .then(res => res.json())
        .then(res => { })
        .catch(err => { });
    });
  });
};

export const downloadPendingStream = async (stopTimer) => {
  let data = await getListOfBroadcastToDownload();
  console.log('Original : ' , data);
  if (data === null || data === undefined) {
    if (Platform.OS === 'android') {
      BackgroundTimer.clearTimeout(stopTimer);
    } else {
      BackgroundTimer.stop();
    }
    return
  }
  else {
    if (data.length !== 0) {
      let streamName = data[data.length - 1];
      streamName = streamName + '.mp4';
      videoDownload(
        streamName,
        result => {
          if (result.status == "success") {
            CameraRoll.saveToCameraRoll(result.path())
              .then(() => {
                result.flush();
                data.pop();
                console.log('REmainging List : ' , data);
                
                setListOfBroadcastToDownload(JSON.stringify(data)).then(() => {
                  console.log('Update Local list of Downloads...');
                  downloadPendingStream();
                })
                console.log('Video Download SuccessFully : ');
              })
              .catch(e => {
                if (Platform.OS === 'android') {
                  BackgroundTimer.clearTimeout(stopTimer);
                } else {
                  BackgroundTimer.stop();
                }
                console.log('Error While SAve : ', e);
              });
          }
          else {
            if (Platform.OS === 'android') {
              BackgroundTimer.clearTimeout(stopTimer);
            } else {
              BackgroundTimer.stop();
            }
          }
        },
        progress => {
          console.log('Progress : ', progress);
        }
      );
    }
    else {
      if (Platform.OS === 'android') {
        BackgroundTimer.clearTimeout(stopTimer);
      } else {
        BackgroundTimer.stop();
      }
    }
  }
}

export const measureConnectionSpeed = imageURIParam => {
  const imageURI= imageURIParam?imageURIParam:'https://drive.google.com/open?id=1T8h_F7nnVNIAAWnluFMNwftVmQtoRGLI';
    return new Promise((resolve, reject) => {
      const startTime = (new Date()).getTime();
      RNFetchBlob
        .config({
          fileCache: false,
        })
        .fetch('GET', imageURI, {})
        .then((res) => {
          const endTime = (new Date()).getTime();
          const duration = (endTime - startTime)/ 1000;
          const speed = (downloadSizeInBits/ (1024 * 1024 * duration));
  
          resolve({metric, speed});
        })
        .catch(reject);
    });
  };

  export const deviceMetaInfo = async () => {
    let metaObject = {
      "brand": DeviceInfo.getBrand(),
      "systemName": DeviceInfo.getSystemName(),
      "deviceName": DeviceInfo.getDeviceName(),
      "systemVersion": DeviceInfo.getSystemVersion(),
      "deviceType": DeviceInfo.getDeviceType(),
      "apiLevel": DeviceInfo.getAPILevel(),
      "timeZone": DeviceInfo.getTimezone(),
    };
   let netInfo = await NetInfo.fetch();
    metaObject.connectionType = netInfo.type;
    metaObject.isConnected = netInfo.isConnected;
    metaObject.connectionDetail = netInfo.details;
    let internetSpeed = await measureConnectionSpeed();
    metaObject.internetSpeed = internetSpeed.speed;
    return metaObject;
  };