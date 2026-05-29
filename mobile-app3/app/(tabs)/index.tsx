import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Modal } from 'react-native';
import { MapView, Marker } from '@/components/Map';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useRoutes } from '@/hooks/use-routes';
import { findNearestStops, getRoutesForStops, Destination, RecommendedStop, RecommendedRoute } from '@/utils/routing';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [recommendedStops, setRecommendedStops] = useState<RecommendedStop[]>([]);
  const [recommendedRoutes, setRecommendedRoutes] = useState<RecommendedRoute[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { announce } = useAccessibility();
  const { routes, loading } = useRoutes();

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

  const handleMapPress = (e: any) => {
    if (loading) return;

    const destination = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };

    setSelectedDestination(destination);

    const stops = findNearestStops(destination, routes);
    setRecommendedStops(stops);

    if (stops.length > 0) {
      const routesForStops = getRoutesForStops(
        stops.map(s => s.stop),
        routes
      );
      setRecommendedRoutes(routesForStops);
      setShowRecommendations(true);
      announce(`Destino seleccionado. Se encontraron ${stops.length} paradas cercanas y ${routesForStops.length} rutas recomendadas`);
    } else {
      announce('No se encontraron paradas cercanas a este destino');
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
        onPress={handleMapPress}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel="Mapa de rutas de transporte"
        accessibilityHint="Toca para seleccionar un destino"
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
        {selectedDestination && (
          <Marker
            coordinate={selectedDestination}
            title="Destino seleccionado"
            pinColor="red"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Destino seleccionado"
            accessibilityHint={`Latitud: ${selectedDestination.latitude.toFixed(2)}, Longitud: ${selectedDestination.longitude.toFixed(2)}`}
          />
        )}
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

      {/* Recomendaciones Modal */}
      <Modal
        visible={showRecommendations && selectedDestination !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowRecommendations(false);
          announce('Panel de recomendaciones cerrado');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recommendationPanel}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessible={true} accessibilityRole="header">
                Destino Seleccionado
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowRecommendations(false);
                  announce('Panel de recomendaciones cerrado');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Ionicons name="close" size={24} color="#7A1F2B" accessible={false} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Paradas Recomendadas */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle} accessible={true} accessibilityRole="header">
                  Paradas Cercanas ({recommendedStops.length})
                </Text>
                {recommendedStops.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={recommendedStops}
                    keyExtractor={(item, index) => `${item.stop.lat}-${item.stop.lon}-${index}`}
                    renderItem={({ item, index }) => (
                      <View style={styles.stopCard} accessible={true} accessibilityRole="text">
                        <View style={styles.stopInfo}>
                          <Text style={styles.stopDistance} accessible={true}>
                            Parada {index + 1} - {(item.distance * 1000).toFixed(0)}m
                          </Text>
                          <Text style={styles.stopRoutes} accessible={true}>
                            {item.routeIds.length} ruta{item.routeIds.length !== 1 ? 's' : ''} disponible{item.routeIds.length !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <Ionicons name="location" size={20} color="#7A1F2B" accessible={false} />
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noData} accessible={true}>No hay paradas cercanas</Text>
                )}
              </View>

              {/* Rutas Recomendadas */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle} accessible={true} accessibilityRole="header">
                  Rutas Recomendadas ({recommendedRoutes.length})
                </Text>
                {recommendedRoutes.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={recommendedRoutes}
                    keyExtractor={(item) => item.route.id}
                    renderItem={({ item }) => (
                      <View style={styles.routeCard} accessible={true} accessibilityRole="button">
                        <View style={styles.routeIcon} accessible={false}>
                          <Ionicons name="bus" size={20} color="#B08A57" accessible={false} />
                        </View>
                        <View style={styles.routeInfo}>
                          <Text style={styles.routeName} accessible={true}>
                            {item.route.name}
                          </Text>
                          <Text style={styles.routeStops} accessible={true}>
                            {item.stopsToUse.length} parada{item.stopsToUse.length !== 1 ? 's' : ''} en esta ruta
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" accessible={false} />
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noData} accessible={true}>No hay rutas disponibles</Text>
                )}
              </View>
            </ScrollView>
          </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  recommendationPanel: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 58, 58, 0.18)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  stopInfo: {
    flex: 1,
  },
  stopDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  stopRoutes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 58, 58, 0.18)',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8DDD0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  routeStops: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
