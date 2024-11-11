import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Modal, FlatList, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      const storedPhotos = JSON.parse(await AsyncStorage.getItem("photosPhotoMapper")) || [];
      setPhotos(storedPhotos);
    })();
  }, []);

  const groupPhotosByCoordinates = (photos: any) => {
    const groupedPhotos = {};
    photos.forEach((photo) => {
      const key = `${photo.coordinates.latitude},${photo.coordinates.longitude}`;
      if (!groupedPhotos[key]) {
        groupedPhotos[key] = [];
      }
      groupedPhotos[key].push(photo);
    });
    return groupedPhotos;
  };

  const groupedPhotos = groupPhotosByCoordinates(photos);

  const handleMarkerPress = (photos) => {
    setSelectedPhotos(photos);
    setModalVisible(true);
  };

  const zoomIn = () => {
    if (mapRef.current && region) {
      mapRef.current.animateToRegion({
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      });
    }
  };

  const zoomOut = () => {
    if (mapRef.current && region) {
      mapRef.current.animateToRegion({
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      });
    }
  };

  if (!region) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}>
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            title="Mi ubicación"
            description="Esta es mi ubicación actual"
          />
        )}
        {Object.keys(groupedPhotos).map((key, index) => {
          const [latitude, longitude] = key.split(",").map(Number);
          return (
            <Marker
              key={index}
              coordinate={{ latitude, longitude }}
              title={`Fotos (${groupedPhotos[key].length})`}
              onPress={() => handleMarkerPress(groupedPhotos[key])}
            />
          );
        })}
      </MapView>
      <View style={styles.zoomButtons}>
        <Pressable style={styles.zoomButton} onPress={zoomIn}>
          <MaterialIcons name="zoom-in" size={24} color="#fff" />
        </Pressable>
        <Pressable style={styles.zoomButton} onPress={zoomOut}>
          <MaterialIcons name="zoom-out" size={24} color="#fff" />
        </Pressable>
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={selectedPhotos}
            keyExtractor={(item) => item.uri}
            renderItem={({ item }) => <Image source={{ uri: item.uri }} style={styles.image} />}
          />
          <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  zoomButtons: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  zoomButton: {
    backgroundColor: "#000",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
  },
  closeButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#000",
  },
});
