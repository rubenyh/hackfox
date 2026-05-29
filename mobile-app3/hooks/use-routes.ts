import { useEffect, useState } from 'react';

export interface RouteStop {
  lat: number;
  lon: number;
  id: string;
}

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface Route {
  ref: string;
  name: string;
  id: string;
  stops: RouteStop[];
  geometry: RouteCoordinate[];
}

const routesData = require('../route-info/routes.json');

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const parsedRoutes: Route[] = [];

      routesData.elements.forEach((element: any) => {
        if (element.type === 'relation' && element.tags?.route === 'bus') {
          const stops: RouteStop[] = [];
          const geometry: RouteCoordinate[] = [];
          const addedCoords = new Set<string>();

          element.members.forEach((member: any) => {
            if (member.role === 'stop') {
              let lat, lon;

              if (member.lat && member.lon) {
                lat = member.lat;
                lon = member.lon;
              } else if (member.geometry && member.geometry.length > 0) {
                lat = member.geometry[0].lat;
                lon = member.geometry[0].lon;
              }

              if (lat && lon) {
                stops.push({
                  lat,
                  lon,
                  id: `${element.id}-${member.ref}`,
                });
              }
            } else if (member.role === 'forward' && member.geometry) {
              member.geometry.forEach((coord: any) => {
                const key = `${coord.lat},${coord.lon}`;
                if (!addedCoords.has(key)) {
                  geometry.push({
                    latitude: coord.lat,
                    longitude: coord.lon,
                  });
                  addedCoords.add(key);
                }
              });
            } else if (member.role === 'backward' && member.geometry) {
              for (let i = member.geometry.length - 1; i >= 0; i--) {
                const coord = member.geometry[i];
                const key = `${coord.lat},${coord.lon}`;
                if (!addedCoords.has(key)) {
                  geometry.push({
                    latitude: coord.lat,
                    longitude: coord.lon,
                  });
                  addedCoords.add(key);
                }
              }
            }
          });

          if (stops.length > 0) {
            parsedRoutes.push({
              ref: element.tags.ref || `Route ${element.id}`,
              name: element.tags.name || `Route ${element.id}`,
              id: String(element.id),
              stops,
              geometry,
            });
          }
        }
      });

      setRoutes(parsedRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { routes, loading };
}
