export type Route = {
  id: string;
  name: string;
  city: string;
  totalKm: number;
  potholeCount: number;
  averageOccupancy: number;
  dailyTrips: number;
  lastUpdated: string;
};

export type PotholeData = {
  routeId: string;
  routeName: string;
  potholesCount: number;
  severity: "low" | "medium" | "high";
  lastReported: string;
};

export type ReportData = {
  id?: string;
  userId?: string;
  incidentType: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  createdAt?: string | number | { toDate: () => Date } | null;
  status: string;
};

export type OccupancyMetric = {
  routeId: string;
  routeName: string;
  hour: number;
  averagePeople: number;
  capacity: number;
};

export type DashboardKPI = {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
};

export type Bus = {
  id: string;
  plate: string;
  capacity: number;
  routeId?: string | null;
  createdAt?: string;
};

export type DriverProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  license?: string;
  assignedBusId?: string | null;
  active?: boolean;
  createdAt?: string;
};

export type RouteStop = {
  id: string;
  stopId: string;
  routeId: string;
  lat: number;
  lng: number;
};
