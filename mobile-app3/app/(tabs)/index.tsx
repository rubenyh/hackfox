import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TextInput, TouchableOpacity } from 'react-native';
import { MapView, Marker } from '@/components/Map';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAccessibility } from '@/context/AccessibilityContext';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<MapView>(null);
  const { announce } = useAccessibility();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        announce('No se pudo obtener la ubicación: permiso denegado');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      announce(`Ubicación obtenida. Latitud: ${loc.coords.latitude.toFixed(2)}, Longitud: ${loc.coords.longitude.toFixed(2)}`);
    })();
  }, [announce]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleRecenter = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
      announce('Mapa recentrado en tu ubicación actual');
    }
  };

  if (!location) {
    return (
      <View style={styles.center} accessible={true} accessibilityRole="progressbar" accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color="#7A1F2B" />
        <Text style={styles.loadingText} accessibilityRole="text">
          Obteniendo ubicación...
        </Text>
        {errorMsg ? <Text style={styles.errorText} accessibilityRole="alert">{errorMsg}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Buscador de rutas flotante */}
      <View
        style={styles.searchContainer}
        accessible={true}
        accessibilityRole="search"
        accessibilityLabel="Área de búsqueda"
      >
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} accessible={false} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ruta o ubicación..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Campo de búsqueda de rutas"
          accessibilityHint="Escribe para buscar rutas o ubicaciones específicas"
        />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#7A1F2B" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Mapa de rutas de transporte"
        accessibilityHint="Muestra tu ubicación actual y las rutas disponibles"
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Tú estás aquí"
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel="Tu ubicación actual"
          accessibilityHint={`Latitud: ${location.coords.latitude.toFixed(2)}, Longitud: ${location.coords.longitude.toFixed(2)}`}
        />
      </MapView>

      {/* Botón flotante para recentrar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleRecenter}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Recentrar mapa"
        accessibilityHint="Centra el mapa en tu ubicación actual"
      >
        <Ionicons name="locate" size={24} color="#7A1F2B" accessible={false} />
      </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  logoutButton: {
    padding: 5,
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
