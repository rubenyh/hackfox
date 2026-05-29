import type { ReactNode } from "react";

export type RouteHealthRow = {
  routeId: string;
  routeName: string;
  averageOccupancy: number;
  peakOccupancy: number;
  dailyTrips: number;
  performanceScore: number;
  status: "Healthy" | "Underutilized" | "Near Capacity" | "Critical";
  reliability: number;
};

export type CoverageRow = {
  routeName: string;
  stopCount: number;
  avgSpacingKm: number;
  demandCluster: number;
  coverageScore: number;
  recommendation: string;
};

export type OverlapRow = {
  routePair: string;
  sharedStops: number;
  overlapPercent: number;
  recommendation: string;
};

export type TravelRow = {
  routeName: string;
  scheduledMins: number;
  actualMins: number;
  delayPercent: number;
  avgSpeed: number;
  recommendation: string;
};

export type ForecastRow = {
  day: string;
  forecastTrips: number;
  forecastOccupancy: number;
};

export type ExecutiveCard = {
  label: string;
  value: string | number;
  icon: ReactNode;
};

export type RecommendationItem = {
  routeName: string;
  detail: string;
  recommendation: string;
};

export type DemandHighlights = {
  highDemand: string[];
  lowDemand: string[];
};
