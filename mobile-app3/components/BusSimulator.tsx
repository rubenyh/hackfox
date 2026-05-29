import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRoutes } from '@/hooks/use-routes';

export function BusSimulator() {
  const [isActive, setIsActive] = useState(false);
  const { routes, loading } = useRoutes();

  useEffect(() => {
    if (!isActive || loading || routes.length === 0) return;

    let simulationIndices: { [busId: string]: number } = {};
    
    // Escogemos 3 rutas al azar para simular
    const routesToSimulate = routes.slice(0, 3).map((route, idx) => ({
      busId: `bus-sim-${idx}`,
      routeId: route.id,
      routeName: route.name,
      geometry: route.geometry,
    }));

    // Iniciar índices en 0
    routesToSimulate.forEach(bus => {
      simulationIndices[bus.busId] = 0;
    });

    const intervalId = setInterval(() => {
      routesToSimulate.forEach(async (bus) => {
        const currentIndex = simulationIndices[bus.busId];
        const nextIndex = (currentIndex + 1) % bus.geometry.length;
        simulationIndices[bus.busId] = nextIndex;

        const currentPos = bus.geometry[nextIndex];
        
        // Simular anomalías aleatorias (10% de probabilidad de 'bache' o 'trafico')
        const rand = Math.random();
        let status = 'normal';
        let anomalyType = 'none';
        let speed = Math.floor(Math.random() * 20) + 30; // 30-50 km/h

        if (rand > 0.95) {
          status = 'anomaly';
          anomalyType = 'pothole'; // Bache detectado por hardware
          speed = 5; // Frena por el bache
        } else if (rand > 0.90) {
          status = 'delayed';
          anomalyType = 'traffic';
          speed = 10;
        }

        try {
          const busRef = doc(db, 'active_buses', bus.busId);
          await setDoc(busRef, {
            busId: bus.busId,
            routeId: bus.routeId,
            routeName: bus.routeName,
            latitude: currentPos.latitude,
            longitude: currentPos.longitude,
            speed: speed,
            status: status,
            anomalyType: anomalyType,
            lastUpdated: serverTimestamp()
          });
        } catch (error) {
          console.error("Error actualizando simulador:", error);
        }
      });
    }, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(intervalId);
  }, [isActive, loading, routes]);

  return (
    <View style={styles.container} accessible={true} accessibilityRole="adjustable" accessibilityLabel="Simulador de camiones IoT">
      <Text style={styles.label}>[DEV] Simulador IoT</Text>
      <Switch 
        value={isActive} 
        onValueChange={setIsActive}
        trackColor={{ false: "#767577", true: "#7A1F2B" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  label: {
    marginRight: 10,
    fontWeight: 'bold',
    color: '#333'
  }
});
