import { Route, RouteStop } from '@/hooks/use-routes';

export interface Destination {
  latitude: number;
  longitude: number;
}

export interface RecommendedStop {
  stop: RouteStop;
  distance: number;
  routeIds: string[];
}

export interface RecommendedRoute {
  route: Route;
  stopsToUse: RouteStop[];
}

export function calculateDistance(
  coord1: { latitude?: number; lon?: number; lat?: number; longitude?: number },
  coord2: { latitude?: number; lon?: number; lat?: number; longitude?: number }
): number {
  const lat1 = coord1.latitude ?? coord1.lat;
  const lon1 = coord1.longitude ?? coord1.lon;
  const lat2 = coord2.latitude ?? coord2.lat;
  const lon2 = coord2.longitude ?? coord2.lon;

  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }

  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

export function findNearestStops(
  destination: Destination,
  routes: Route[],
  maxDistance: number = 0.5 // 500 meters
): RecommendedStop[] {
  const stopsMap = new Map<string, RecommendedStop>();

  routes.forEach(route => {
    route.stops.forEach(stop => {
      const distance = calculateDistance(destination, stop);

      if (distance <= maxDistance) {
        const key = `${stop.lat},${stop.lon}`;
        if (stopsMap.has(key)) {
          const existing = stopsMap.get(key)!;
          existing.routeIds.push(route.id);
        } else {
          stopsMap.set(key, {
            stop,
            distance,
            routeIds: [route.id],
          });
        }
      }
    });
  });

  return Array.from(stopsMap.values()).sort((a, b) => a.distance - b.distance);
}

export function getRoutesForStops(
  stops: RouteStop[],
  routes: Route[]
): RecommendedRoute[] {
  const stopCoordinates = new Set(stops.map(s => `${s.lat},${s.lon}`));
  const recommendedRoutes: RecommendedRoute[] = [];

  routes.forEach(route => {
    const stopsToUse = route.stops.filter(
      stop => stopCoordinates.has(`${stop.lat},${stop.lon}`)
    );

    if (stopsToUse.length > 0) {
      recommendedRoutes.push({
        route,
        stopsToUse,
      });
    }
  });

  return recommendedRoutes;
}
