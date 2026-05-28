import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';

const MOCK_ROUTE_COORDINATES = [
  { latitude: 32.5255, longitude: -117.0267 }, // Zona Centro
  { latitude: 32.5220, longitude: -117.0175 }, // Mercado Hidalgo
  { latitude: 32.5158, longitude: -117.0050 }, // Río Tijuana
  { latitude: 32.5080, longitude: -116.9922 }, // Blvd. Agua Caliente
  { latitude: 32.5025, longitude: -116.9805 }, // Las Torres
  { latitude: 32.4950, longitude: -116.9650 }, // Estadio Caliente / Hipódromo
];

export default function MapScreen() {
  const initialRegion = {
    latitude: 32.5149,
    longitude: -117.0382,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        <Polyline
          coordinates={MOCK_ROUTE_COORDINATES}
          strokeColor="#0000FF" // Azul eléctrico
          strokeWidth={5}
        />
        <Marker 
          coordinate={MOCK_ROUTE_COORDINATES[0]} 
          title="Inicio de Ruta" 
        />
        <Marker 
          coordinate={MOCK_ROUTE_COORDINATES[MOCK_ROUTE_COORDINATES.length - 1]} 
          title="Fin de Ruta" 
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
