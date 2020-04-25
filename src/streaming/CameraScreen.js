import React from "react";
import { StyleSheet, View } from "react-native";
import { RNCamera } from "react-native-camera";

export default class CameraScreen extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { isFrontCamera } = this.props;
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={
            isFrontCamera
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          }
          flashMode={RNCamera.Constants.FlashMode.off}
        />
      </View>
    );
  }

  takePicture = async () => {
    if (this.camera) {
      const options = {
        quality: 0.2,
        base64: true,
        orientation: RNCamera.Constants.Orientation.portrait,
        fixOrientation: true
      };
      this.camera
        .takePictureAsync(options)
        .then(result => {
          this.props.getSnapShot(result.base64);
        })
        .catch(error => {
          this.props.getSnapShot();
        });
    } else {
      this.props.getSnapShot();
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black"
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  }
});
