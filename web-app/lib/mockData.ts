import { Route, PotholeData, OccupancyMetric } from "./types";

export const mockRoutes: Route[] = [
  {
    id: "R1",
    name: "Ruta Centro - Norte",
    city: "Bogotá",
    totalKm: 25.5,
    potholeCount: 12,
    averageOccupancy: 78,
    dailyTrips: 45,
    lastUpdated: "2026-05-28T10:30:00Z",
  },
  {
    id: "R2",
    name: "Ruta Sur - Este",
    city: "Bogotá",
    totalKm: 18.3,
    potholeCount: 24,
    averageOccupancy: 82,
    dailyTrips: 52,
    lastUpdated: "2026-05-28T10:25:00Z",
  },
  {
    id: "R3",
    name: "Ruta Centro - Oeste",
    city: "Bogotá",
    totalKm: 22.1,
    potholeCount: 8,
    averageOccupancy: 65,
    dailyTrips: 38,
    lastUpdated: "2026-05-28T10:20:00Z",
  },
  {
    id: "R4",
    name: "Ruta Aeropuerto",
    city: "Bogotá",
    totalKm: 35.2,
    potholeCount: 18,
    averageOccupancy: 71,
    dailyTrips: 62,
    lastUpdated: "2026-05-28T10:15:00Z",
  },
  {
    id: "R5",
    name: "Ruta Periférica",
    city: "Bogotá",
    totalKm: 41.8,
    potholeCount: 31,
    averageOccupancy: 55,
    dailyTrips: 28,
    lastUpdated: "2026-05-28T10:10:00Z",
  },
];

export const mockPotholes: PotholeData[] = [
  {
    routeId: "R5",
    routeName: "Ruta Periférica",
    potholesCount: 31,
    severity: "high",
    lastReported: "2026-05-28",
  },
  {
    routeId: "R2",
    routeName: "Ruta Sur - Este",
    potholesCount: 24,
    severity: "high",
    lastReported: "2026-05-28",
  },
  {
    routeId: "R4",
    routeName: "Ruta Aeropuerto",
    potholesCount: 18,
    severity: "medium",
    lastReported: "2026-05-27",
  },
  {
    routeId: "R1",
    routeName: "Ruta Centro - Norte",
    potholesCount: 12,
    severity: "medium",
    lastReported: "2026-05-27",
  },
  {
    routeId: "R3",
    routeName: "Ruta Centro - Oeste",
    potholesCount: 8,
    severity: "low",
    lastReported: "2026-05-26",
  },
];

export const mockOccupancy: OccupancyMetric[] = [
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 6, averagePeople: 25, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 7, averagePeople: 62, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 8, averagePeople: 78, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 9, averagePeople: 55, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 17, averagePeople: 72, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 18, averagePeople: 80, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 19, averagePeople: 68, capacity: 80 },
  { routeId: "R1", routeName: "Ruta Centro - Norte", hour: 20, averagePeople: 42, capacity: 80 },
];
