import { Route, RouteStop } from '@/hooks/use-routes';

const GOOGLE_API_KEY = 'AIzaSyBcjPHiJqveQFzZ-qoIa_ojPgWxUZ436TE';

export interface Destination {
  latitude: number;
  longitude: number;
}

export type LegType = 'WALK' | 'TRANSIT';

export interface RouteLeg {
  type: LegType;
  distance: number; // km
  time: number; // minutes
  path: Destination[];
  // If TRANSIT:
  route?: Route;
  originStop?: RouteStop;
  destinationStop?: RouteStop;
}

export interface TransitRouteResult {
  legs: RouteLeg[];
  totalDistance: number;
  totalTime: number;
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
        distance: distanceMeters / 1000,
        time: Math.ceil(durationSeconds / 60),
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
    let result = 0, shift = 0, c;
    do {
      c = encoded.charCodeAt(index++) - 63;
      result |= (c & 0x1f) << shift;
      shift += 5;
    } while (c >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    result = 0, shift = 0;
    do {
      c = encoded.charCodeAt(index++) - 63;
      result |= (c & 0x1f) << shift;
      shift += 5;
    } while (c >= 0x20);
    lon += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push({ latitude: lat / 1e5, longitude: lon / 1e5 });
  }

  return points;
}

function getRouteSegment(route: Route, originStop: RouteStop, destStop: RouteStop): { path: Destination[], distanceKm: number } {
  if (!route.geometry || route.geometry.length < 2) return { path: [], distanceKm: 0 };
  
  let startIdx = 0;
  let endIdx = route.geometry.length - 1;
  let minDistToOrigin = Infinity;
  let minDistToDest = Infinity;
  
  for (let i = 0; i < route.geometry.length; i++) {
    const distO = calculateDistance(route.geometry[i], originStop);
    if (distO < minDistToOrigin) {
      minDistToOrigin = distO;
      startIdx = i;
    }
    const distD = calculateDistance(route.geometry[i], destStop);
    if (distD < minDistToDest) {
      minDistToDest = distD;
      endIdx = i;
    }
  }
  
  if (startIdx > endIdx) {
    const temp = startIdx;
    startIdx = endIdx;
    endIdx = temp;
  }
  
  const path = route.geometry.slice(startIdx, endIdx + 1);
  let distanceKm = 0;
  for (let i = 0; i < path.length - 1; i++) {
    distanceKm += calculateDistance(path[i], path[i+1]);
  }
  
  return { path, distanceKm };
}

export async function calculateTransitRoute(
  userLocation: Destination,
  destination: Destination,
  routes: Route[]
): Promise<TransitRouteResult | null> {
  if (routes.length === 0) return null;

  let bestDirect = { route: null as any, origin: null as any, dest: null as any, score: Infinity };
  
  // 1. Evaluate Direct Routes
  for (const route of routes) {
    if (route.stops.length < 2) continue;

    let nearestOrigin = route.stops[0];
    let minOriginDist = Infinity;
    let nearestDest = route.stops[route.stops.length - 1];
    let minDestDist = Infinity;

    for (const stop of route.stops) {
      const dO = calculateDistance(userLocation, stop);
      if (dO < minOriginDist) { minOriginDist = dO; nearestOrigin = stop; }
      
      const dD = calculateDistance(destination, stop);
      if (dD < minDestDist) { minDestDist = dD; nearestDest = stop; }
    }

    const score = minOriginDist + minDestDist; // Rough heuristic (walking distance)
    if (score < bestDirect.score) {
      bestDirect = { route, origin: nearestOrigin, dest: nearestDest, score };
    }
  }

  // 2. Evaluate 1-Transfer Routes
  let bestTransfer = {
    route1: null as any, origin1: null as any, dest1: null as any,
    route2: null as any, origin2: null as any, dest2: null as any,
    score: Infinity
  };

  const TRANSFER_THRESHOLD = 0.3; // 300 meters max walking transfer

  if (bestDirect.score > 2.0) { // If you have to walk more than 2km, look for a transfer!
    for (const r1 of routes) {
      if (r1.stops.length < 2) continue;
      
      let o1 = r1.stops[0];
      let minO1 = Infinity;
      for (const s of r1.stops) {
        const d = calculateDistance(userLocation, s);
        if (d < minO1) { minO1 = d; o1 = s; }
      }
      
      if (minO1 > 1.5) continue; // Skip if too far to even start
      
      for (const r2 of routes) {
        if (r1.id === r2.id || r2.stops.length < 2) continue;
        
        let d2 = r2.stops[0];
        let minD2 = Infinity;
        for (const s of r2.stops) {
          const d = calculateDistance(destination, s);
          if (d < minD2) { minD2 = d; d2 = s; }
        }
        
        if (minD2 > 1.5) continue; // Skip if too far from destination

        // Find transfer intersection
        for (const s1 of r1.stops) {
          for (const s2 of r2.stops) {
            const transferDist = calculateDistance(s1, s2);
            if (transferDist < TRANSFER_THRESHOLD) {
              const score = minO1 + minD2 + transferDist;
              if (score < bestTransfer.score) {
                bestTransfer = {
                  route1: r1, origin1: o1, dest1: s1,
                  route2: r2, origin2: s2, dest2: d2,
                  score
                };
              }
            }
          }
        }
      }
    }
  }

  // 3. Choose Best approach and build Legs
  const legs: RouteLeg[] = [];
  let totalDist = 0;
  let totalTime = 0;

  if (bestTransfer.score < bestDirect.score - 0.5) { // If transfer saves more than 500m of walking
    // Multi-leg
    const walk1 = await getWalkingRoute(userLocation, { latitude: bestTransfer.origin1.lat, longitude: bestTransfer.origin1.lon });
    const segment1 = getRouteSegment(bestTransfer.route1, bestTransfer.origin1, bestTransfer.dest1);
    const busTime1 = Math.min(Math.ceil(segment1.distanceKm / 1), 20) || 5;

    const walkTransfer = await getWalkingRoute(
      { latitude: bestTransfer.dest1.lat, longitude: bestTransfer.dest1.lon },
      { latitude: bestTransfer.origin2.lat, longitude: bestTransfer.origin2.lon }
    );
    const segment2 = getRouteSegment(bestTransfer.route2, bestTransfer.origin2, bestTransfer.dest2);
    const busTime2 = Math.min(Math.ceil(segment2.distanceKm / 1), 20) || 5;

    const walk2 = await getWalkingRoute({ latitude: bestTransfer.dest2.lat, longitude: bestTransfer.dest2.lon }, destination);

    // Leg 1: Walk to bus 1
    const w1Dist = walk1?.distance ?? calculateDistance(userLocation, bestTransfer.origin1);
    const w1Time = walk1?.time ?? Math.ceil((w1Dist / 5) * 60);
    legs.push({ type: 'WALK', distance: w1Dist, time: w1Time, path: walk1?.path ?? [userLocation, { latitude: bestTransfer.origin1.lat, longitude: bestTransfer.origin1.lon }] });

    // Leg 2: Bus 1
    legs.push({ type: 'TRANSIT', distance: segment1.distanceKm, time: busTime1, path: segment1.path, route: bestTransfer.route1, originStop: bestTransfer.origin1, destinationStop: bestTransfer.dest1 });

    // Leg 3: Walk transfer
    const wtDist = walkTransfer?.distance ?? calculateDistance(bestTransfer.dest1, bestTransfer.origin2);
    const wtTime = walkTransfer?.time ?? Math.ceil((wtDist / 5) * 60);
    if (wtDist > 0.02) { // Only add transfer walk if it's > 20 meters
      legs.push({ type: 'WALK', distance: wtDist, time: wtTime, path: walkTransfer?.path ?? [{ latitude: bestTransfer.dest1.lat, longitude: bestTransfer.dest1.lon }, { latitude: bestTransfer.origin2.lat, longitude: bestTransfer.origin2.lon }] });
    }

    // Leg 4: Bus 2
    legs.push({ type: 'TRANSIT', distance: segment2.distanceKm, time: busTime2, path: segment2.path, route: bestTransfer.route2, originStop: bestTransfer.origin2, destinationStop: bestTransfer.dest2 });

    // Leg 5: Walk to destination
    const w2Dist = walk2?.distance ?? calculateDistance(bestTransfer.dest2, destination);
    const w2Time = walk2?.time ?? Math.ceil((w2Dist / 5) * 60);
    legs.push({ type: 'WALK', distance: w2Dist, time: w2Time, path: walk2?.path ?? [{ latitude: bestTransfer.dest2.lat, longitude: bestTransfer.dest2.lon }, destination] });

  } else {
    // Direct
    if (bestDirect.score === Infinity) return null; // Failsafe

    const walk1 = await getWalkingRoute(userLocation, { latitude: bestDirect.origin.lat, longitude: bestDirect.origin.lon });
    const segment = getRouteSegment(bestDirect.route, bestDirect.origin, bestDirect.dest);
    const busTime = Math.min(Math.ceil(segment.distanceKm / 1), 20) || 5;
    const walk2 = await getWalkingRoute({ latitude: bestDirect.dest.lat, longitude: bestDirect.dest.lon }, destination);

    const w1Dist = walk1?.distance ?? calculateDistance(userLocation, bestDirect.origin);
    const w1Time = walk1?.time ?? Math.ceil((w1Dist / 5) * 60);
    legs.push({ type: 'WALK', distance: w1Dist, time: w1Time, path: walk1?.path ?? [userLocation, { latitude: bestDirect.origin.lat, longitude: bestDirect.origin.lon }] });

    legs.push({ type: 'TRANSIT', distance: segment.distanceKm, time: busTime, path: segment.path, route: bestDirect.route, originStop: bestDirect.origin, destinationStop: bestDirect.dest });

    const w2Dist = walk2?.distance ?? calculateDistance(bestDirect.dest, destination);
    const w2Time = walk2?.time ?? Math.ceil((w2Dist / 5) * 60);
    legs.push({ type: 'WALK', distance: w2Dist, time: w2Time, path: walk2?.path ?? [{ latitude: bestDirect.dest.lat, longitude: bestDirect.dest.lon }, destination] });
  }

  legs.forEach(l => {
    totalDist += l.distance;
    totalTime += l.time;
  });

  return { legs, totalDistance: totalDist, totalTime };
}
