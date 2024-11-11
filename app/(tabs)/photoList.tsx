import React, { useState, useCallback } from "react";
import { Text, View, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function PhotoListScreen() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadPhotos = async () => {
    try {
      const storedPhotos = JSON.parse(await AsyncStorage.getItem("photosPhotoMapper")) || [];
      setPhotos(storedPhotos);
    } catch (error) {
      console.error("Failed to load photos", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo === selectedPhoto ? null : photo);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePhotoPress(item)}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            {selectedPhoto === item && (
              <View style={styles.coordinatesContainer}>
                <Text>Coordenadas de la foto:</Text>
                {item.coordinates ? (
                  <>
                    <Text>Latitud: {item.coordinates.latitude}</Text>
                    <Text>Longitud: {item.coordinates.longitude}</Text>
                  </>
                ) : (
                  <Text>No tiene coordenadas</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
  },
  coordinatesContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
});
