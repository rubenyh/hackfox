import { useEffect, useState } from 'react';

export interface RouteStop {
  lat: number;
  lon: number;
  id: string;
}

export interface Route {
  ref: string;
  name: string;
  id: string;
  stops: RouteStop[];
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

          element.members.forEach((member: any) => {
            if (member.role === 'stop' && member.lat && member.lon) {
              stops.push({
                lat: member.lat,
                lon: member.lon,
                id: `${element.id}-${member.ref}`,
              });
            }
          });

          if (stops.length > 0) {
            parsedRoutes.push({
              ref: element.tags.ref || `Route ${element.id}`,
              name: element.tags.name || `Route ${element.id}`,
              id: String(element.id),
              stops,
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
