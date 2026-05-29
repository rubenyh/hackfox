import { Route, RouteStop } from '@/hooks/use-routes';

const GOOGLE_API_KEY = 'AIzaSyBcjPHiJqveQFzZ-qoIa_ojPgWxUZ436TE';

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
  walkToBusTime: number; // in minutes
  walkFromBusTime: number; // in minutes
  estimatedBusTime: number; // in minutes
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

async function getWalkingRoute(origin: Destination, destination: Destination): Promise<{
  distance: number;
  time: number;
  path: Destination[];
} | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.latitude},${origin.longitude}&` +
      `destination=${destination.latitude},${destination.longitude}&` +
      `mode=walking&` +
      `key=${GOOGLE_API_KEY}`
    );

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceMeters = route.legs[0].distance.value;
      const durationSeconds = route.legs[0].duration.value;

      const path = decodePolyline(route.overview_polyline.points);

      return {
        distance: distanceMeters / 1000, // convert to km
        time: Math.ceil(durationSeconds / 60), // convert to minutes
        path: path
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching walking route:', error);
    return null;
  }
}

function decodePolyline(encoded: string): Destination[] {
  const points: Destination[] = [];
  let index = 0, lat = 0, lon = 0;

  while (index < encoded.length) {
    let result = 0, shift = 0;
    let c;

    do {
      c = encoded.charCodeAt(index++) - 63;
      result |= (c & 0x1f) << shift;
      shift += 5;
    } while (c >= 0x20);

    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    result = 0;
    shift = 0;

    do {
      c = encoded.charCodeAt(index++) - 63;
      result |= (c & 0x1f) << shift;
      shift += 5;
    } while (c >= 0x20);

    lon += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push({
      latitude: lat / 1e5,
      longitude: lon / 1e5
    });
  }

  return points;
}

export async function calculateTransitRoute(
  userLocation: Destination,
  destination: Destination,
  routes: Route[]
): Promise<TransitRouteResult | null> {
  if (routes.length === 0) return null;

  let bestRoute: Route | null = null;
  let bestOriginStop: RouteStop | null = null;
  let bestDestStop: RouteStop | null = null;
  let minTotalDistance = Infinity;
  let bestWalkToBusData: Awaited<ReturnType<typeof getWalkingRoute>> = null;
  let bestWalkFromBusData: Awaited<ReturnType<typeof getWalkingRoute>> = null;

  // Find the route that minimizes walking distance at both ends
  for (const route of routes) {
    if (route.stops.length < 2) continue;

    // Find nearest stop to user, and nearest stop to destination
    let nearestOrigin = route.stops[0];
    let minOriginDist = Infinity;

    let nearestDest = route.stops[route.stops.length - 1];
    let minDestDist = Infinity;

    for (const stop of route.stops) {
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
    }

    // Get real walking distances from Google Directions API
    const walkToBusData = await getWalkingRoute(
      userLocation,
      { latitude: nearestOrigin.lat, longitude: nearestOrigin.lon }
    );
    const walkFromBusData = await getWalkingRoute(
      { latitude: nearestDest.lat, longitude: nearestDest.lon },
      destination
    );

    const totalWalkDistance = (walkToBusData?.distance || minOriginDist) + (walkFromBusData?.distance || minDestDist);

    if (totalWalkDistance < minTotalDistance) {
      minTotalDistance = totalWalkDistance;
      bestRoute = route;
      bestOriginStop = nearestOrigin;
      bestDestStop = nearestDest;
      bestWalkToBusData = walkToBusData;
      bestWalkFromBusData = walkFromBusData;
    }
  }

  if (!bestRoute || !bestOriginStop || !bestDestStop) {
    // Failsafe: return first route with dummy data
    bestRoute = routes[0];
    bestOriginStop = bestRoute.stops[0];
    bestDestStop = bestRoute.stops[bestRoute.stops.length - 1];
  }

  // Calculate bus travel time based on route segment between origin and destination stops
  let busTime = 10; // default fallback
  if (bestRoute.geometry && bestRoute.geometry.length > 1) {
    // Find geometry indices for stops to calculate only the relevant segment
    let startIdx = 0;
    let endIdx = bestRoute.geometry.length - 1;

    // Find closest geometry point to origin stop
    let minDistToOrigin = Infinity;
    for (let i = 0; i < bestRoute.geometry.length; i++) {
      const dist = calculateDistance(bestRoute.geometry[i], bestOriginStop);
      if (dist < minDistToOrigin) {
        minDistToOrigin = dist;
        startIdx = i;
      }
    }

    // Find closest geometry point to destination stop
    let minDistToDest = Infinity;
    for (let i = 0; i < bestRoute.geometry.length; i++) {
      const dist = calculateDistance(bestRoute.geometry[i], bestDestStop);
      if (dist < minDistToDest) {
        minDistToDest = dist;
        endIdx = i;
      }
    }

    // Calculate distance only between origin and destination stops
    let segmentDistanceKm = 0;
    if (startIdx <= endIdx) {
      for (let i = startIdx; i < endIdx; i++) {
        segmentDistanceKm += calculateDistance(bestRoute.geometry[i], bestRoute.geometry[i + 1]);
      }
    }

    // Use 60 km/h average speed = 1 km/min for realistic urban bus speeds
    if (segmentDistanceKm > 0) {
      busTime = Math.ceil(segmentDistanceKm / 1);
      // Cap at 20 minutes maximum
      busTime = Math.min(busTime, 20);
    }
  }

  return {
    route: bestRoute,
    originStop: bestOriginStop,
    destinationStop: bestDestStop,
    walkToBusDistance: bestWalkToBusData?.distance ?? calculateDistance(userLocation, bestOriginStop),
    walkFromBusDistance: bestWalkFromBusData?.distance ?? calculateDistance(destination, bestDestStop),
    walkToBusPath: bestWalkToBusData?.path ?? [
      userLocation,
      { latitude: bestOriginStop.lat, longitude: bestOriginStop.lon }
    ],
    walkFromBusPath: bestWalkFromBusData?.path ?? [
      { latitude: bestDestStop.lat, longitude: bestDestStop.lon },
      destination
    ],
    walkToBusTime: bestWalkToBusData?.time ?? 10,
    walkFromBusTime: bestWalkFromBusData?.time ?? 10,
    estimatedBusTime: busTime
  };
}
