import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapView, Marker, Polyline } from '@/components/Map';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutes } from '@/hooks/use-routes';
import { useAccessibility } from '@/context/AccessibilityContext';

const WebColors = {
  background: '#F7F4EF',
  primary: '#7A1F2B',
  tint: '#B08A57',
  secondary: '#E8DDD0',
  surface: '#FFFFFF',
  border: 'rgba(58, 58, 58, 0.18)',
};

export default function RutasScreen() {
  const { routes, loading } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const { announce } = useAccessibility();

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  useEffect(() => {
    if (selectedRoute) {
      announce(`Ruta seleccionada: ${selectedRoute.name} con ${selectedRoute.stops.length} paradas`);
    }
  }, [selectedRouteId, selectedRoute, announce]);

  if (loading) {
    return (
      <View style={styles.container} accessible={true} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={WebColors.primary} />
        <Text accessible={true} accessibilityRole="text" accessibilityLiveRegion="polite">
          Cargando rutas...
        </Text>
      </View>
    );
  }

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  return (
    <View style={styles.container}>
      {selectedRoute ? (
        <View style={styles.mapContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setSelectedRouteId(null);
                announce('Volviendo a la lista de rutas');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Volver a rutas"
              accessibilityHint="Regresa a la lista de todas las rutas"
            >
              <Ionicons name="chevron-back" size={24} color={WebColors.primary} accessible={false} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text
                style={styles.headerTitle}
                accessible={true}
                accessibilityRole="header"
              >
                {selectedRoute.name}
              </Text>
              <Text
                style={styles.headerSubtitle}
                accessible={true}
                accessibilityRole="text"
              >
                {selectedRoute.stops.length} paradas
              </Text>
            </View>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setShowRoute(!showRoute);
                announce(showRoute ? 'Ruta oculta del mapa' : 'Ruta mostrada en el mapa');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={showRoute ? 'Ocultar ruta' : 'Mostrar ruta'}
              accessibilityHint={showRoute ? 'Oculta la línea de la ruta del mapa' : 'Muestra la línea de la ruta en el mapa'}
            >
              {/* <Ionicons
                name={showRoute ? "eye" : "eye-off"}
                size={24}
                color={Colors.light.primary}
              /> */}
            </TouchableOpacity>
          </View>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: selectedRoute.stops[0].lat,
              longitude: selectedRoute.stops[0].lon,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`Mapa de la ruta ${selectedRoute.name}`}
            accessibilityHint={`Muestra la ruta con ${selectedRoute.stops.length} paradas`}
          >
            {showRoute && (
              <Polyline
                coordinates={selectedRoute.geometry.length > 0 ? selectedRoute.geometry : selectedRoute.stops.map(stop => ({
                  latitude: stop.lat,
                  longitude: stop.lon,
                }))}
                strokeColor={WebColors.primary}
                strokeWidth={6}
                accessible={false}
              />
            )}
            {selectedRoute.stops.map((stop, index) => (
              <Marker
                key={stop.id}
                coordinate={{ latitude: stop.lat, longitude: stop.lon }}
                title={`Parada ${index + 1}`}
                pinColor={index === 0 ? WebColors.primary : index === selectedRoute.stops.length - 1 ? 'red' : 'blue'}
                accessible={true}
                accessibilityRole="image"
                accessibilityLabel={`Parada ${index + 1}`}
                accessibilityHint={index === 0 ? 'Inicio de la ruta' : index === selectedRoute.stops.length - 1 ? 'Fin de la ruta' : 'Parada intermedia'}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <>
          <FlatList
            data={routes}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleSelectRoute(item.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                accessibilityHint={`${item.stops.length} paradas. Toca para ver en el mapa`}
              >
                <View style={styles.cardIcon} accessible={false}>
                  <Ionicons name="bus" size={24} color={WebColors.tint} accessible={false} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} accessible={false}>{item.name}</Text>
                  <Text style={styles.cardSubtitle} accessible={false}>{item.stops.length} paradas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" accessible={false} />
              </TouchableOpacity>
            )}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel="Lista de rutas disponibles"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WebColors.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: WebColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: WebColors.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  toggleButton: {
    padding: 8,
  },
  card: {
    backgroundColor: WebColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WebColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: WebColors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
