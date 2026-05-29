import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Modal } from 'react-native';
import { MapView, Marker, Polyline } from '@/components/Map';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoutes } from '@/hooks/use-routes';
import { calculateTransitRoute, Destination, TransitRouteResult } from '@/utils/routing';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebaseConfig';
import { BusSimulator } from '@/components/BusSimulator';
import { useGeocoding } from '@/hooks/use-geocoding';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeBuses, setActiveBuses] = useState<any[]>([]);
  const [transitRoute, setTransitRoute] = useState<TransitRouteResult | null>(null);
  const mapRef = useRef<MapView>(null);
  const { announce } = useAccessibility();
  const insets = useSafeAreaInsets();
  const { routes, loading } = useRoutes();
  const { results, searching, searchPlace, clearResults, getPlaceDetails } = useGeocoding();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [announce]);

  useEffect(() => {
    // Escuchar la ruta de camiones activos en Firebase RTDB en tiempo real
    console.log('[MapScreen] Conectando a Firebase RTDB en: /active_buses/data');
    const busesRef = ref(rtdb, '/active_buses/data');
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('[MapScreen] Datos recibidos de Firebase:', data);
      if (data) {
        // Si es un objeto singular (un solo camión)
        const buses = Array.isArray(data)
          ? data
          : [{ id: data.busId, ...data }];
        console.log('[MapScreen] Buses procesados:', buses.length, buses);
        setActiveBuses(buses);
      } else {
        console.log('[MapScreen] No hay datos en /active_buses/data');
        setActiveBuses([]);
      }
    }, (error) => {
      console.error('[MapScreen] Error conectando a Firebase:', error);
    });

    return () => unsubscribe();
  }, []);

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
    setTransitRoute(null);

    const routeResult = calculateTransitRoute(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      destination,
      routes
    );

    if (routeResult) {
      setTransitRoute(routeResult);
      announce(`Ruta calculada hacia destino.`);
    } else {
      announce('No se encontraron rutas disponibles');
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length > 2) {
      setShowSearchResults(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchPlace(text, location?.coords.latitude, location?.coords.longitude);
      }, 500) as unknown as NodeJS.Timeout;
    } else {
      clearResults();
      setShowSearchResults(false);
    }
  };

  const handleSelectSearchResult = async (result: typeof results[0]) => {
    // Sacamos los detalles (lat, lon) con el placeId
    const coords = await getPlaceDetails(result.placeId);
    
    if (!coords) {
      announce('No se pudo obtener la ubicación exacta del lugar');
      return;
    }
    
    const destination: Destination = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    setSelectedDestination(destination);
    setTransitRoute(null);
    setSearchQuery('');
    setShowSearchResults(false);
    clearResults();

    const routeResult = calculateTransitRoute(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      destination,
      routes
    );

    if (routeResult) {
      setTransitRoute(routeResult);
      announce(`Ruta calculada hacia ${result.name}.`);
    } else {
      announce(`No se encontraron rutas hacia ${result.name}`);
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
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
      <BusSimulator />
      <View
        style={[styles.searchContainerWrapper, { top: insets.top + 16 }]}
        accessible={true}
        accessibilityRole="search"
        accessibilityLabel="Área de búsqueda"
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} accessible={false} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ruta o ubicación..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            accessibilityLabel="Campo de búsqueda de rutas"
            accessibilityHint="Escribe para buscar rutas o ubicaciones específicas"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
                clearResults();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
            >
              <Ionicons name="close-circle" size={20} color="#999" accessible={false} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.micButton}
            onPress={() => announce('Búsqueda por voz. Función en desarrollo')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Búsqueda por voz"
            accessibilityHint="Toca para buscar una ruta usando tu voz"
          >
            <Ionicons name="mic" size={24} color="#7A1F2B" accessible={false} />
          </TouchableOpacity>
        </View>

        {showSearchResults && (results.length > 0 || searching) && (
          <View style={styles.searchResultsContainer}>
            {searching ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="small" color="#7A1F2B" />
                <Text style={styles.searchLoadingText} accessible={true}>Buscando...</Text>
              </View>
            ) : (
              <FlatList
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
                data={results}
                keyExtractor={(item) => item.placeId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    accessibilityHint={item.address || 'Toca para seleccionar'}
                  >
                    <Ionicons name="location" size={18} color="#7A1F2B" style={styles.resultIcon} accessible={false} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultName} accessible={false}>{item.name}</Text>
                      {item.address && (
                        <Text style={styles.resultAddress} accessible={false}>{item.address}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
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
        {activeBuses.map((bus) => {
          if (!bus || bus.latitude === undefined || bus.longitude === undefined) {
            console.warn('Bus inválido:', bus);
            return null;
          }
          return (
            <Marker
              key={bus.id}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={bus.routeName || 'Camión'}
              description={`Velocidad: ${bus.speed || 0} km/h ${bus.status === 'anomaly' ? '- ¡ANOMALÍA/BACHE!' : ''}`}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Camión ${bus.routeName || 'desconocido'} en movimiento`}
            >
              <View style={[
                styles.busMarker,
                bus.status === 'delayed' ? styles.busDelayed : null,
                bus.status === 'anomaly' ? styles.busAnomaly : null
              ]}>
                <Ionicons name="bus" size={16} color="white" accessible={false} />
              </View>
            </Marker>
          );
        })}
        {transitRoute && (
          <>
            <Polyline
              coordinates={transitRoute.walkToBusPath}
              strokeColor="#3498db"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
            <Polyline
              coordinates={transitRoute.route.geometry}
              strokeColor="#7A1F2B"
              strokeWidth={5}
            />
            <Polyline
              coordinates={transitRoute.walkFromBusPath}
              strokeColor="#3498db"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
            <Marker coordinate={{ latitude: transitRoute.originStop.lat, longitude: transitRoute.originStop.lon }} title="Sube aquí" pinColor="blue" />
            <Marker coordinate={{ latitude: transitRoute.destinationStop.lat, longitude: transitRoute.destinationStop.lon }} title="Baja aquí" pinColor="blue" />
          </>
        )}
      </MapView>

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

      <Modal
        visible={transitRoute !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setTransitRoute(null);
          announce('Ruta cerrada');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recommendationPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessible={true} accessibilityRole="header">
                Viaje Sugerido
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTransitRoute(null);
                  announce('Ruta cerrada');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Ionicons name="close" size={24} color="#7A1F2B" accessible={false} />
              </TouchableOpacity>
            </View>

            {transitRoute && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.itineraryStep}>
                  <Ionicons name="walk" size={24} color="#3498db" />
                  <View style={styles.itineraryText}>
                    <Text style={styles.stepTitle}>Camina hacia la Parada</Text>
                    <Text style={styles.stepDesc}>{(transitRoute.walkToBusDistance * 1000).toFixed(0)} metros</Text>
                  </View>
                </View>
                
                <View style={styles.itineraryDivider} />

                <View style={styles.itineraryStep}>
                  <Ionicons name="bus" size={24} color="#7A1F2B" />
                  <View style={styles.itineraryText}>
                    <Text style={styles.stepTitle}>Sube al: {transitRoute.route.name}</Text>
                    <Text style={styles.stepDesc}>15 min estimados (IoT activo)</Text>
                  </View>
                </View>

                <View style={styles.itineraryDivider} />

                <View style={styles.itineraryStep}>
                  <Ionicons name="walk" size={24} color="#3498db" />
                  <View style={styles.itineraryText}>
                    <Text style={styles.stepTitle}>Camina a tu destino</Text>
                    <Text style={styles.stepDesc}>{(transitRoute.walkFromBusDistance * 1000).toFixed(0)} metros</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.startTripBtn} onPress={() => { setTransitRoute(null); alert('¡Viaje Iniciado! Sigue las instrucciones.'); }}>
                  <Text style={styles.startTripText}>INICIAR VIAJE</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  searchContainerWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
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
  micButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchResultsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  searchLoadingText: {
    color: '#666',
    fontSize: 14,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 58, 58, 0.1)',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  resultAddress: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
  itineraryStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  itineraryText: {
    marginLeft: 15,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
  },
  itineraryDivider: {
    height: 30,
    width: 2,
    backgroundColor: '#ccc',
    marginLeft: 11,
  },
  startTripBtn: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  startTripText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  busMarker: {
    backgroundColor: '#B08A57',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  busDelayed: {
    backgroundColor: '#F2994A', // Naranja
  },
  busAnomaly: {
    backgroundColor: '#EB5757', // Rojo
  },
});
