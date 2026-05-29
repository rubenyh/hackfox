import { Route, RouteStop } from '@/hooks/use-routes';

export interface Destination {
  latitude: number;
  longitude: number;
}

export interface TransitRouteResult {
  route: Route;
  originStop: RouteStop;
  destinationStop: RouteStop;
  walkToBusDistance: number; // in km
  walkFromBusDistance: number; // in km
  walkToBusPath: Destination[];
  walkFromBusPath: Destination[];
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

export function calculateTransitRoute(
  userLocation: Destination,
  destination: Destination,
  routes: Route[]
): TransitRouteResult | null {
  if (routes.length === 0) return null;

  let bestRoute: Route | null = null;
  let bestOriginStop: RouteStop | null = null;
  let bestDestStop: RouteStop | null = null;
  let minTotalDistance = Infinity;

  // Find the route that minimizes walking distance at both ends
  routes.forEach(route => {
    if (route.stops.length < 2) return;

    // Simplification: Find nearest stop to user, and nearest stop to destination
    let nearestOrigin = route.stops[0];
    let minOriginDist = Infinity;
    
    let nearestDest = route.stops[route.stops.length - 1];
    let minDestDist = Infinity;

    route.stops.forEach(stop => {
      const distToUser = calculateDistance(userLocation, stop);
      if (distToUser < minOriginDist) {
        minOriginDist = distToUser;
        nearestOrigin = stop;
      }

      const distToDest = calculateDistance(destination, stop);
      if (distToDest < minDestDist) {
        minDestDist = distToDest;
        nearestDest = stop;
      }
    });

    const totalWalk = minOriginDist + minDestDist;
    if (totalWalk < minTotalDistance) {
      minTotalDistance = totalWalk;
      bestRoute = route;
      bestOriginStop = nearestOrigin;
      bestDestStop = nearestDest;
    }
  });

  if (!bestRoute || !bestOriginStop || !bestDestStop) {
    // Failsafe para prototipo: Regresar la ruta 0 forzada
    bestRoute = routes[0];
    bestOriginStop = bestRoute.stops[0];
    bestDestStop = bestRoute.stops[bestRoute.stops.length - 1];
  }

  const walkToBusDistance = calculateDistance(userLocation, bestOriginStop);
  const walkFromBusDistance = calculateDistance(destination, bestDestStop);

  return {
    route: bestRoute,
    originStop: bestOriginStop,
    destinationStop: bestDestStop,
    walkToBusDistance,
    walkFromBusDistance,
    walkToBusPath: [
      userLocation,
      { latitude: bestOriginStop.lat, longitude: bestOriginStop.lon }
    ],
    walkFromBusPath: [
      { latitude: bestDestStop.lat, longitude: bestDestStop.lon },
      destination
    ]
  };
}
