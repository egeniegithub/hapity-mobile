import React from "react";
import RNFetchBlob from "rn-fetch-blob";
import { GoogleAuthConstants } from "../Config/Constants";
import moment from 'moment';

const baseUrl = "https://staging.hapity.com/api/";
// const baseUrl = "https://www.hapity.com/api/";
// const baseUrl = "http://192.168.20.251/hapity-api/api/";
const getTokenFromAuthCodeUrl = "https://oauth2.googleapis.com/token";
const getAccessTokenUrl = "https://www.googleapis.com/oauth2/v4/token";
const createLiveBroadcastUrl = "https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet%2Cstatus%2CcontentDetails";
const createYoutubestreamUrl = "https://youtube.googleapis.com/youtube/v3/liveStreams?part=snippet%2Ccdn%2CcontentDetails%2Cstatus";
let bindBroadcastToStreamUrl = "https://youtube.googleapis.com/youtube/v3/liveBroadcasts/bind";

class ApiName {
  static login = baseUrl + "login";
  static signUp = baseUrl + "register";
  static twitterLogin = baseUrl + "twitter/login";
  static fbLogin = baseUrl + "facebook/login";
  static broadcastsForUser = baseUrl + "broadcasts/all";
  static deleteBroadcast = baseUrl + "broadcasts/delete";
  static editBroadcast = baseUrl + "broadcasts/edit";
  static uploadBroadcast = baseUrl + "broadcasts/upload";
  static getProfileInfo = baseUrl + "get_profile_info";
  static editProfile = baseUrl + "edit_profile";
  static videoDownload = baseUrl + "broadcasts/download";
  static startBroadcastUrl = baseUrl + "broadcasts/start";
  static timeStampBroadcastUrl = baseUrl + "broadcasts/update/timestamp";
  static stopBroadcast = baseUrl + "broadcasts/stop";
  static rtmpEndpoint = baseUrl + "add_rtmp_endpoint";
}

export const youtubeApis = {
  getTokenFromAuthCode: (authCode, callback) => {
    let params = {
      client_id: GoogleAuthConstants.webClientId,
      client_secret: GoogleAuthConstants.clientSecret,
      code: authCode,
      grant_type: "authorization_code",
      redirect_uri: GoogleAuthConstants.redirectUrl
    };

    let request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    };
    processNetworkRequest(getTokenFromAuthCodeUrl, request, callback, 60000);
  },

  getAccessToken: (token, callback) => {
    let params = {
      client_id: GoogleAuthConstants.webClientId,
      client_secret: GoogleAuthConstants.clientSecret,
      refresh_token: token,
      grant_type: "refresh_token",
    };

    let request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    };
    processNetworkRequest(getAccessTokenUrl, request, callback, 60000);
  },

  createLiveBroadcast: (token, title, callback) => {
    if (!title) {
      title = "Untitled"
    }
    let params = {
      snippet: {
        title: title,
        scheduledStartTime: moment().format(),
      },
      contentDetails: {
        enableClosedCaptions: true,
        enableContentEncryption: true,
        enableDvr: true,
        recordFromStart: true,
        startWithSlate: true,
        enableAutoStart: true,
        enableAutoStop: true,
        monitorStream: {
          enableMonitorStream: false
        }
      },
      status: {
        privacyStatus: "public"
      }
    };

    let request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(params)
    };
    processNetworkRequest(createLiveBroadcastUrl, request, callback, 60000);
  },

  createYoutubeStream : (token, title, callback) => {
    if (!title) {
      title = "Untitled"
    }
    let params = {
      snippet: {
        title: title,
        description: ""
      },
      cdn: {
        frameRate: "60fps",
        ingestionType: "rtmp",
        resolution: "1080p"
      },
      contentDetails: {
        isReusable: false
      }
    };

    let request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(params)
    };
    processNetworkRequest(createYoutubestreamUrl, request, callback, 60000);
  },

  bindBroadcastToStream : (token, id, streamId, callback) => {
    let bindUrl = `${bindBroadcastToStreamUrl}?id=${id}&streamId=${streamId}`;
    let params = {
      id,
      streamId
    };

    let request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(params)
    };
    processNetworkRequest(bindUrl, request, callback, 60000);
  }

};

export const doLogin = async (email, password, meta_info, callback) => {
  let params = {
    login: email,
    password: password,
    meta_info: meta_info,
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  };

  processNetworkRequest(ApiName.login, request, callback, 30000);
};

export const doSignUp = async (
  username,
  email,
  password,
  profile_picture,
  meta_info,
  callback
) => {
  let params = {
    username: username,
    email: email,
    password: password,
    profile_picture: profile_picture,
    meta_info: meta_info,
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  };

  processNetworkRequest(ApiName.signUp, request, callback, 30000);
};

export const loginWithTwitter = async (
  twitter_id,
  username,
  email,
  profile_picture,
  callback
) => {
  let params = {
    social_id: twitter_id,
    username: username,
    email: email,
    profile_picture: profile_picture
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  };

  processNetworkRequest(ApiName.twitterLogin, request, callback, 30000);
};

export const loginWithFaceBook = async (
  facebook_id,
  username,
  email,
  profile_picture,
  callback
) => {
  let params = {
    social_id: facebook_id,
    username: username,
    email: email,
    profile_picture: profile_picture
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  };

  processNetworkRequest(ApiName.fbLogin, request, callback, 30000);
};

export const getAllBroadcastsForUser = async (token, user_id, callback) => {
  let params = {
    user_id: user_id
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };
  processNetworkRequest(ApiName.broadcastsForUser, request, callback, 30000);
};

export const deleteBroadcast = async (
  token,
  user_id,
  stream_url,
  stream_id,
  callback
) => {
  let params = {
    user_id: user_id,
    broadcast_id: stream_id
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };
  processNetworkRequest(ApiName.deleteBroadcast, request, callback, 30000);
};

export const editBroadcast = async (
  token,
  user_id,
  stream_url,
  stream_id,
  title,
  description,
  image,
  video,
  callback,
  progressCallback
) => {
  let params = [
    { name: "user_id", data: String(user_id) },
    { name: "stream_url", data: stream_url },
    { name: "title", data: title },
    { name: "description", data: description },
    { name: "broadcast_id", data: String(stream_id) }
  ];

  if (image != "") {
    params.push({
      name: "image",
      filename: "hapityFileName.jpg",
      data: RNFetchBlob.wrap(image)
    });
  }

  if (video != "") {
    params.push({
      name: "video",
      filename: "HapityVideo.mp4",
      type: "application/mp4",
      data: RNFetchBlob.wrap(video)
    });
  }

  RNFetchBlob.fetch(
    "POST",
    ApiName.editBroadcast,
    {
      Authorization: "Bearer " + token,
      "Content-Type": "multipart/form-data"
    },
    params
  )
    .uploadProgress((written, total) => {
      progressCallback(written / total);
    })
    .then(res => {
      callback(res);
    })
    .catch(err => {
      errorResponse = {
        status: "error",
        message: String(err)
      };
      callback(errorResponse);
    });
};
export const uploadBroadcast = async (
  token,
  user_id,
  stream_url,
  title,
  description,
  is_sensitive,
  geo_location,
  post_plugin,
  image,
  video,
  meta_info,
  callback,
  progressCallback
) => {
  let params = [
    { name: "user_id", data: String(user_id) },
    { name: "stream_url", data: stream_url },
    { name: "title", data: title },
    { name: "description", data: description },
    { name: "is_sensitive", data: is_sensitive },
    { name: "geo_location", data: geo_location },
    { name: "post_plugin", data: post_plugin },
    { name: "meta_info", data: JSON.stringify(meta_info) }
  ];

  if (image != "") {
    params.push({
      name: "image",
      filename: "hapityFileName.jpg",
      data: RNFetchBlob.wrap(image)
    });
  }

  if (video != "") {
    params.push({
      name: "video",
      filename: "HapityVideo.mp4",
      type: "application/mp4",
      data: RNFetchBlob.wrap(video)
    });
  }

  RNFetchBlob.fetch(
    "POST",
    ApiName.uploadBroadcast,
    {
      Authorization: "Bearer " + token,
      "Content-Type": "multipart/form-data"
    },
    params
  )
    .uploadProgress((written, total) => {
      progressCallback(written / total);
    })
    .then(res => {
      callback(res);
    })
    .catch(err => {
      errorResponse = {
        status: "error",
        message: String(err)
      };
      callback(errorResponse);
    });
};

export const getProfileInfo = async (token, callback) => {
  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    }
  };
  processNetworkRequest(ApiName.getProfileInfo, request, callback, 30000);
};

export const timeStampBroadcastUrl = async (token, broadcast_id, callback) => {
  let params = {
    broadcast_id: broadcast_id
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };
  processNetworkRequest(
    ApiName.timeStampBroadcastUrl,
    request,
    callback,
    30000
  );
};

export const stopBroadcast = async (token, broadcast_id, callback) => {
  let params = {
    broadcast_id: broadcast_id
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };
  processNetworkRequest(ApiName.stopBroadcast, request, callback, 30000);
};

export const shareStreamOnYoutube = async (token, stream_id, rtmp_endpoint, callback) => {
  let params = {
    stream_id,
    rtmp_endpoint
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };
  processNetworkRequest(ApiName.rtmpEndpoint, request, callback, 30000);
};

export const editProfile = async (
  user_id,
  token,
  username,
  email,
  password,
  profile_picture,
  callback
) => {
  let params = {
    user_id: user_id,
    username: username,
    email: email,
    password: password,
    profile_picture: profile_picture
  };

  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };

  processNetworkRequest(ApiName.editProfile, request, callback, 30000);
};

export const videoDownload = async (stream_url, callback, progressCallback) => {
  let url =
    ApiName.videoDownload + "?file_name=" + stream_url;

  RNFetchBlob.config({
    fileCache: true,
    appendExt: "mp4"
  })
    .fetch("GET", url, {})
    .progress({ count: 10 }, (received, total) => {
      progressCallback(received / total);
    })
    .then(res => {
      res.status = "success";
      callback(res);
    })
    .catch(err => {
      errorResponse = {
        status: "error",
        message: String(err)
      };
      callback(errorResponse);
    });
};

export const startBroadcastUrl = async (
  user_id,
  token,
  title,
  geo_location,
  is_sensitive,
  post_plugin,
  stream_url,
  image,
  meta_info,
  callback
) => {
  let params = {
    user_id: user_id,
    title: title,
    description: "",
    is_sensitive: is_sensitive,
    geo_location: geo_location,
    stream_url: stream_url,
    post_plugin: post_plugin,
    image: image,
    meta_info: meta_info,
    is_antmedia: "yes"
  };
  let request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(params)
  };
  processNetworkRequest(ApiName.startBroadcastUrl, request, callback, 30000);
};

function processNetworkRequest(url, request, callback, TIME_OUT) {
  let didTimeOut = false;
  new Promise(function (resolve, reject) {
    const timeout = setTimeout(() => {
      didTimeOut = true;
      reject(new Error("Request Time Out."));
    }, TIME_OUT);

    fetch(url, request)
      .then(processResponse)
      .then(function (response) {
        clearTimeout(timeout);
        if (!didTimeOut) {
          resolve(response);
        }
      })
      .catch(function (err) {
        if (didTimeOut) return;
        reject(err);
      });
  })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (err) {
      err.didTimeOut = didTimeOut;
      processError(err, callback);
    });
}

function processResponse(response) {
  return new Promise((resolve, reject) => {
    let func;
    response.status < 400 ? (func = resolve) : (func = reject);
    response.json().then(data => func({ status: response.status, data: data }));
  });
}

function processError(response, callback) {
  if (response.status !== undefined) {
    if (response.status < 500) {
      callback(response.data);
    } else if (response.status >= 500) {
      let responseJson = {
        status: "error",
        message: "Network Error! Request Failed"
      };
      callback(responseJson);
    }
  } else {
    let responseJson;
    if (response.didTimeOut) {
      responseJson = { status: "error", message: "Network Request Timeout" };
    } else {
      responseJson = {
        status: "error",
        message: "Network Error. Request Failed!"
      };
    }
    callback(responseJson);
  }
}
