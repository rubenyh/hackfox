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
