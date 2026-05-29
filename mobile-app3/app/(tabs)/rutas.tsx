import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapView, Marker, Polyline } from '@/components/Map';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutes } from '@/hooks/use-routes';

export default function RutasScreen() {
  const { routes, loading } = useRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedRoute ? (
        <View style={styles.mapContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedRouteId(null)}>
              <Ionicons name="chevron-back" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{selectedRoute.name}</Text>
              <Text style={styles.headerSubtitle}>{selectedRoute.stops.length} paradas</Text>
            </View>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowRoute(!showRoute)}
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
          >
            {showRoute && (
              <Polyline
                coordinates={selectedRoute.stops.map(stop => ({
                  latitude: stop.lat,
                  longitude: stop.lon,
                }))}
                strokeColor={Colors.light.primary}
                strokeWidth={3}
              />
            )}
            {selectedRoute.stops.map((stop, index) => (
              <Marker
                key={stop.id}
                coordinate={{ latitude: stop.lat, longitude: stop.lon }}
                title={`Parada ${index + 1}`}
                pinColor={index === 0 ? Colors.light.primary : index === selectedRoute.stops.length - 1 ? 'red' : 'blue'}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Rutas Disponibles</Text>
          <FlatList
            data={routes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedRouteId(item.id)}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="bus" size={24} color={Colors.light.tint} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.stops.length} paradas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 20,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.light.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    backgroundColor: Colors.light.secondary,
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
