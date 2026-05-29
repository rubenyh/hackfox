"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
// Removed mock data fallback: use only Firestore data
import { Bus, OccupancyMetric, Route, RouteStop } from "@/lib/types";
import type {
  CoverageRow,
  DemandHighlights,
  ExecutiveCard,
  ForecastRow,
  HeatmapPoint,
  OverlapRow,
  RecommendationItem,
  RouteHealthRow,
  TravelRow,
} from "@/components/analytics/types";
import { Activity, AlertTriangle, Clock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

export type AnalyticsData = {
  buses: Bus[];
  routesData: Route[];
  routeHealth: RouteHealthRow[];
  routeHealthColumns: Array<{
    key: keyof RouteHealthRow;
    label: string;
    render?: (val: any) => ReactNode;
  }>;
  executiveCards: ExecutiveCard[];
  demandHighlights: DemandHighlights;
  peakHourData: Array<{ hour: string; occupancy: number }>;
  heatmapPoints: HeatmapPoint[];
  heatmapCenter: { lat: number; lng: number };
  capacityRecommendations: RecommendationItem[];
  fleetRecommendations: RecommendationItem[];
  coverageRows: CoverageRow[];
  coverageColumns: Array<{
    key: keyof CoverageRow;
    label: string;
    render?: (val: any) => ReactNode;
  }>;
  overlapRows: OverlapRow[];
  overlapColumns: Array<{
    key: keyof OverlapRow;
    label: string;
    render?: (val: any) => ReactNode;
  }>;
  travelRows: TravelRow[];
  travelColumns: Array<{
    key: keyof TravelRow;
    label: string;
    render?: (val: any) => ReactNode;
  }>;
  forecastRows: ForecastRow[];
  forecastColumns: Array<{
    key: keyof ForecastRow;
    label: string;
    render?: (val: any) => ReactNode;
  }>;
  aiActions: string[];
  topRoutesAttention: RouteHealthRow[];
  isSimulated: boolean;
};

export function useAnalyticsData(): AnalyticsData {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [metrics, setMetrics] = useState<OccupancyMetric[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const routesRef = query(collection(db, "routes"), orderBy("name"));
    const metricsRef = query(collection(db, "occupancyMetrics"), orderBy("hour"));
    const routeStopsRef = query(collection(db, "routeStops"));
    const busesRef = query(collection(db, "buses"), orderBy("plate"));

    const unsubRoutes = onSnapshot(routesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Route, "id">),
      }));
      setRoutes(next);
    });

    const unsubMetrics = onSnapshot(metricsRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        ...(doc.data() as OccupancyMetric),
      }));
      setMetrics(next);
    });

    const unsubRouteStops = onSnapshot(routeStopsRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<RouteStop, "id">),
      }));
      setRouteStops(next);
    });

    const unsubBuses = onSnapshot(busesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Bus, "id">),
      }));
      setBuses(next);
    });

    return () => {
      unsubRoutes();
      unsubMetrics();
      unsubRouteStops();
      unsubBuses();
    };
  }, []);

  const routesData = routes;
  const metricsData = metrics;

  const occupancyByRoute = useMemo(() => {
    return metricsData.reduce<Record<string, number[]>>((acc, metric) => {
      const occupancy = metric.capacity
        ? Math.round((metric.averagePeople / metric.capacity) * 100)
        : 0;
      if (!acc[metric.routeId]) acc[metric.routeId] = [];
      acc[metric.routeId].push(occupancy);
      return acc;
    }, {});
  }, [metricsData]);

  const stopCountByRoute = useMemo(() => {
    if (routeStops.length === 0) return {} as Record<string, number>;
    return routeStops.reduce<Record<string, number>>((acc, stop) => {
      acc[stop.routeId] = (acc[stop.routeId] || 0) + 1;
      return acc;
    }, {});
  }, [routeStops]);

  const maxTrips = useMemo(
    () => Math.max(1, ...routesData.map((route) => route.dailyTrips)),
    [routesData]
  );

  const routeHealth = useMemo(() => {
    return routesData.map<RouteHealthRow>((route) => {
      const occupancy = occupancyByRoute[route.id] || [];
      const peakOccupancy = occupancy.length ? Math.max(...occupancy) : route.averageOccupancy;
      const avgOccupancy = occupancy.length
        ? Math.round(occupancy.reduce((sum, val) => sum + val, 0) / occupancy.length)
        : route.averageOccupancy;
      const tripScore = Math.round((route.dailyTrips / maxTrips) * 100);
      const reliability = Math.max(45, Math.min(98, 100 - Math.abs(peakOccupancy - avgOccupancy) * 1.2));
      const performanceScore = Math.round(
        avgOccupancy * 0.35 + peakOccupancy * 0.25 + tripScore * 0.2 + reliability * 0.2
      );

      let status: RouteHealthRow["status"] = "Healthy";
      if (avgOccupancy < 35) status = "Underutilized";
      else if (peakOccupancy >= 96) status = "Critical";
      else if (avgOccupancy >= 85 || peakOccupancy >= 90) status = "Near Capacity";

      return {
        routeId: route.id,
        routeName: route.name,
        averageOccupancy: avgOccupancy,
        peakOccupancy,
        dailyTrips: route.dailyTrips,
        performanceScore,
        status,
        reliability: Math.round(reliability),
      };
    });
  }, [routesData, occupancyByRoute, maxTrips]);

  const criticalRoutes = useMemo(
    () => routeHealth.filter((route) => route.status === "Critical"),
    [routeHealth]
  );

  const overcrowdedRoutes = useMemo(
    () => routeHealth.filter((route) => route.peakOccupancy >= 90),
    [routeHealth]
  );

  const underutilizedRoutes = useMemo(
    () => routeHealth.filter((route) => route.status === "Underutilized"),
    [routeHealth]
  );

  const capacityRecommendations = useMemo<RecommendationItem[]>(() => {
    return routeHealth
      .filter((route) => route.averageOccupancy >= 85 || route.peakOccupancy >= 92)
      .map((route) => ({
        routeName: route.routeName,
        detail: `Promedio ${route.averageOccupancy}% | Pico ${route.peakOccupancy}%`,
        recommendation: "Agregar buses en horario pico o aumentar frecuencia",
      }));
  }, [routeHealth]);

  const fleetRecommendations = useMemo<RecommendationItem[]>(() => {
    return routeHealth
      .filter((route) => route.averageOccupancy <= 35 && route.dailyTrips <= maxTrips * 0.5)
      .map((route) => ({
        routeName: route.routeName,
        detail: `Ocupacion ${route.averageOccupancy}% | ${route.dailyTrips} viajes/dia`,
        recommendation: "Reasignar buses a rutas con mayor demanda",
      }));
  }, [routeHealth, maxTrips]);

  const executiveCards = useMemo<ExecutiveCard[]>(() => {
    const estimatedSavings = Math.max(0, fleetRecommendations.length * 1200);
    const waitReduction = Math.min(18, capacityRecommendations.length * 3);
    const coverageScore = Math.round(
      routeHealth.reduce((sum, route) => sum + route.reliability, 0) / Math.max(1, routeHealth.length)
    );

    return [
      {
        label: "Rutas Criticas",
        value: criticalRoutes.length,
        icon: <AlertTriangle size={22} />,
      },
      {
        label: "Rutas Saturadas",
        value: overcrowdedRoutes.length,
        icon: <TrendingUp size={22} />,
      },
      {
        label: "Rutas Subutilizadas",
        value: underutilizedRoutes.length,
        icon: <TrendingDown size={22} />,
      },
      {
        label: "Ahorro Mensual Estimado",
        value: `$${estimatedSavings.toLocaleString("en-US")}`,
        icon: <Sparkles size={22} />,
      },
      {
        label: "Reduccion Esperada de Espera",
        value: `${waitReduction}%`,
        icon: <Clock size={22} />,
      },
      {
        label: "Puntaje de Cobertura",
        value: `${coverageScore}%`,
        icon: <Activity size={22} />,
      },
    ];
  }, [criticalRoutes.length, overcrowdedRoutes.length, underutilizedRoutes.length, fleetRecommendations.length, capacityRecommendations.length, routeHealth]);

  const peakHourData = useMemo(() => {
    const byHour = metricsData.reduce<Record<number, { total: number; count: number }>>(
      (acc, metric) => {
        const occupancy = metric.capacity
          ? (metric.averagePeople / metric.capacity) * 100
          : 0;
        if (!acc[metric.hour]) acc[metric.hour] = { total: 0, count: 0 };
        acc[metric.hour].total += occupancy;
        acc[metric.hour].count += 1;
        return acc;
      },
      {}
    );

    return Object.keys(byHour)
      .map((hour) => {
        const item = byHour[Number(hour)];
        return {
          hour: `${hour}:00`,
          occupancy: Math.round(item.total / Math.max(1, item.count)),
        };
      })
      .sort((a, b) => Number.parseInt(a.hour, 10) - Number.parseInt(b.hour, 10));
  }, [metricsData]);

  const heatmapCenter = useMemo(() => {
    if (!routeStops.length) return { lat: 4.711, lng: -74.0721 };
    const totals = routeStops.reduce(
      (acc, stop) => ({ lat: acc.lat + stop.lat, lng: acc.lng + stop.lng }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: totals.lat / routeStops.length,
      lng: totals.lng / routeStops.length,
    };
  }, [routeStops]);

  const heatmapPoints = useMemo<HeatmapPoint[]>(() => {
    if (!routeStops.length) return [];
    const weightByRoute = routeHealth.reduce<Record<string, number>>((acc, route) => {
      acc[route.routeId] = Math.max(10, route.averageOccupancy);
      return acc;
    }, {});

    return routeStops.map((stop) => ({
      location: { lat: stop.lat, lng: stop.lng },
      weight: weightByRoute[stop.routeId] ?? 30,
    }));
  }, [routeStops, routeHealth]);

  const coverageRows = useMemo<CoverageRow[]>(() => {
    return routesData.map((route) => {
      const stopCount = stopCountByRoute[route.id] ?? Math.max(4, Math.round(route.totalKm / 3));
      const avgSpacingKm = Number((route.totalKm / Math.max(1, stopCount)).toFixed(2));
      const demandCluster = Math.round((route.dailyTrips / maxTrips) * 100);
      const coverageScore = Math.max(40, Math.round(100 - avgSpacingKm * 10 + demandCluster * 0.2));
      const recommendation = coverageScore < 60
        ? "Agregar nuevas paradas o crear ruta alimentadora"
        : coverageScore < 75
        ? "Extender tramos en zonas residenciales"
        : "Cobertura adecuada";

      return {
        routeName: route.name,
        stopCount,
        avgSpacingKm,
        demandCluster,
        coverageScore,
        recommendation,
      };
    });
  }, [routesData, stopCountByRoute, maxTrips]);

  const overlapRows = useMemo<OverlapRow[]>(() => {
    if (routeStops.length === 0) return [];

    const stopsByRoute = routeStops.reduce<Record<string, Set<string>>>((acc, stop) => {
      if (!acc[stop.routeId]) acc[stop.routeId] = new Set();
      acc[stop.routeId].add(stop.stopId);
      return acc;
    }, {});

    const routeIds = Object.keys(stopsByRoute);
    const rows: OverlapRow[] = [];

    for (let i = 0; i < routeIds.length; i += 1) {
      for (let j = i + 1; j < routeIds.length; j += 1) {
        const a = routeIds[i];
        const b = routeIds[j];
        const setA = stopsByRoute[a];
        const setB = stopsByRoute[b];
        const shared = [...setA].filter((stopId) => setB.has(stopId));
        if (shared.length === 0) continue;

        const overlapPercent = Math.round((shared.length / Math.min(setA.size, setB.size)) * 100);
        const routeA = routesData.find((route) => route.id === a)?.name || a;
        const routeB = routesData.find((route) => route.id === b)?.name || b;

        rows.push({
          routePair: `${routeA} + ${routeB}`,
          sharedStops: shared.length,
          overlapPercent,
          recommendation: overlapPercent > 60 ? "Evaluar fusion" : "Coordinar frecuencias",
        });
      }
    }

    return rows.sort((a, b) => b.overlapPercent - a.overlapPercent).slice(0, 6);
  }, [routeStops, routesData]);

  const travelRows = useMemo<TravelRow[]>(() => {
    return routesData.map((route) => {
      const avgSpeed = 25;
      const scheduledMins = Math.round((route.totalKm / avgSpeed) * 60);
      const crowdPenalty = route.averageOccupancy / 200;
      const actualMins = Math.round(scheduledMins * (1 + crowdPenalty));
      const delayPercent = Math.round(((actualMins - scheduledMins) / scheduledMins) * 100);
      const liveSpeed = Number((route.totalKm / (actualMins / 60)).toFixed(1));
      const recommendation = delayPercent > 20
        ? "Ajustar horario o carril preferente"
        : delayPercent > 10
        ? "Revisar tiempos de parada"
        : "Sin ajustes";

      return {
        routeName: route.name,
        scheduledMins,
        actualMins,
        delayPercent,
        avgSpeed: liveSpeed,
        recommendation,
      };
    });
  }, [routesData]);

  const forecastRows = useMemo<ForecastRow[]>(() => {
    const totalTrips = routesData.reduce((sum, route) => sum + route.dailyTrips, 0);
    const avgOccupancy = routeHealth.reduce((sum, route) => sum + route.averageOccupancy, 0) / Math.max(1, routeHealth.length);
    const growthRate = avgOccupancy > 80 ? 0.03 : avgOccupancy < 50 ? -0.02 : 0.01;
    const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

    return dayNames.map((day, index) => {
      const factor = Math.pow(1 + growthRate, index + 1);
      const forecastTrips = Math.round(totalTrips * factor);
      const forecastOccupancy = Math.min(98, Math.max(30, Math.round(avgOccupancy * factor)));
      return {
        day,
        forecastTrips,
        forecastOccupancy,
      };
    });
  }, [routesData, routeHealth]);

  const aiActions = useMemo(() => {
    const actions = [
      ...capacityRecommendations.map((rec) => `Aumentar buses en ${rec.routeName}`),
      ...fleetRecommendations.map((rec) => `Reasignar flota desde ${rec.routeName}`),
    ];

    const coverageAction = coverageRows.find((row) => row.coverageScore < 60);
    if (coverageAction) {
      actions.push(`Agregar paradas en ${coverageAction.routeName}`);
    }

    const overlapAction = overlapRows.find((row) => row.overlapPercent > 60);
    if (overlapAction) {
      actions.push(`Evaluar fusion: ${overlapAction.routePair}`);
    }

    return actions.slice(0, 6);
  }, [capacityRecommendations, fleetRecommendations, coverageRows, overlapRows]);

  const demandHighlights = useMemo<DemandHighlights>(() => {
    const highDemand = routeHealth
      .filter((route) => route.averageOccupancy >= 80)
      .map((route) => route.routeName)
      .slice(0, 4);
    const lowDemand = routeHealth
      .filter((route) => route.averageOccupancy <= 40)
      .map((route) => route.routeName)
      .slice(0, 4);

    return { highDemand, lowDemand };
  }, [routeHealth]);

  const topRoutesAttention = useMemo(
    () => [...routeHealth].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5),
    [routeHealth]
  );

  // After removing mock fallbacks, data is considered simulated=false.
  // Keep the flag for UI compatibility; it's always false now.
  const isSimulated = false;

  const routeHealthColumns = [
    { key: "routeName" as const, label: "Ruta" },
    { key: "averageOccupancy" as const, label: "Ocupacion promedio", render: (val: number) => `${val}%` },
    { key: "peakOccupancy" as const, label: "Pico", render: (val: number) => `${val}%` },
    { key: "dailyTrips" as const, label: "Viajes/dia" },
    { key: "performanceScore" as const, label: "Score" },
    {
      key: "status" as const,
      label: "Estado",
      render: (value: RouteHealthRow["status"]) => (
        <span
          className={`px-3 py-1 text-xs gov-badge ${
            value === "Critical"
              ? "gov-badge-high"
              : value === "Near Capacity"
              ? "gov-badge-medium"
              : value === "Underutilized"
              ? "gov-badge-low"
              : "gov-badge-healthy"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const coverageColumns = [
    { key: "routeName" as const, label: "Ruta" },
    { key: "stopCount" as const, label: "Paradas" },
    { key: "avgSpacingKm" as const, label: "Km por parada" },
    { key: "demandCluster" as const, label: "Demanda (%)" },
    { key: "coverageScore" as const, label: "Cobertura" },
    { key: "recommendation" as const, label: "Recomendacion" },
  ];

  const overlapColumns = [
    { key: "routePair" as const, label: "Rutas" },
    { key: "sharedStops" as const, label: "Paradas compartidas" },
    { key: "overlapPercent" as const, label: "Overlap (%)" },
    { key: "recommendation" as const, label: "Accion" },
  ];

  const travelColumns = [
    { key: "routeName" as const, label: "Ruta" },
    { key: "scheduledMins" as const, label: "Programado (min)" },
    { key: "actualMins" as const, label: "Real (min)" },
    { key: "delayPercent" as const, label: "Retraso (%)" },
    { key: "avgSpeed" as const, label: "Velocidad km/h" },
    { key: "recommendation" as const, label: "Recomendacion" },
  ];

  const forecastColumns = [
    { key: "day" as const, label: "Dia" },
    { key: "forecastTrips" as const, label: "Viajes" },
    { key: "forecastOccupancy" as const, label: "Ocupacion", render: (val: number) => `${val}%` },
  ];

  return {
    buses,
    routesData,
    routeHealth,
    routeHealthColumns,
    executiveCards,
    demandHighlights,
    peakHourData,
    heatmapPoints,
    heatmapCenter,
    capacityRecommendations,
    fleetRecommendations,
    coverageRows,
    coverageColumns,
    overlapRows,
    overlapColumns,
    travelRows,
    travelColumns,
    forecastRows,
    forecastColumns,
    aiActions,
    topRoutesAttention,
    isSimulated,
  };
}
