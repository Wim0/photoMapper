import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import * as Location from "expo-location";
import { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoPermission, requestPhotoPermission] = MediaLibrary.usePermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant camera permission" />
      </View>
    );
  }
  if (!photoPermission) {
    return <View />;
  }
  if (!photoPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to save photos</Text>
        <Button onPress={requestPhotoPermission} title="grant media library permission" />
      </View>
    );
  }
  if (!locationPermission) {
    return <View />;
  }
  if (!locationPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access location</Text>
        <Button onPress={requestLocationPermission} title="grant location permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const photo = await captureRef(cameraRef, {
          format: "jpg",
          quality: 0.8,
        });
        if (photo) {
          const asset = await MediaLibrary.createAssetAsync(photo);
          const directory = `${FileSystem.documentDirectory}photosPhotoMapper/`;
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
          const newPath = `${directory}${Date.now()}.jpg`;
          await FileSystem.copyAsync({
            from: asset.uri,
            to: newPath,
          });

          const photoData = {
            uri: newPath,
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          };

          // Guardar la información de la foto en AsyncStorage
          const storedPhotos = JSON.parse(await AsyncStorage.getItem("photosPhotoMapper")) || [];
          storedPhotos.push({ uri: photoData.uri, coordinates: photoData.coordinates });
          await AsyncStorage.setItem("photosPhotoMapper", JSON.stringify(storedPhotos));

          alert("Photo saved with coordinates!");
        } else {
          alert("Failed to capture photo");
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while taking the photo");
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
