"use client";

import { DataTable } from "@/components/DataTable";
import { db } from "@/lib/firebase/firebase";
import { OccupancyMetric } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function OccupancyPage() {
  const [metrics, setMetrics] = useState<OccupancyMetric[]>([]);

  useEffect(() => {
    const metricsRef = query(collection(db, "occupancyMetrics"), orderBy("hour"));
    const unsubscribe = onSnapshot(metricsRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        ...(doc.data() as OccupancyMetric),
      }));
      setMetrics(next);
    });
    return () => unsubscribe();
  }, []);

  const selectedRouteId = useMemo(() => {
    if (metrics.length === 0) return "";
    const counts = metrics.reduce<Record<string, number>>((acc, metric) => {
      acc[metric.routeId] = (acc[metric.routeId] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "";
  }, [metrics]);

  const selectedRouteName = useMemo(() => {
    if (!selectedRouteId) return "";
    return metrics.find((metric) => metric.routeId === selectedRouteId)?.routeName || "";
  }, [metrics, selectedRouteId]);

  const chartData = useMemo(() => {
    if (!selectedRouteId) return [] as { hour: string; people: number; capacity: number }[];
    return metrics
      .filter((metric) => metric.routeId === selectedRouteId)
      .sort((a, b) => a.hour - b.hour)
      .map((metric) => ({
        hour: `${metric.hour}:00`,
        people: metric.averagePeople,
        capacity: metric.capacity,
      }));
  }, [metrics, selectedRouteId]);

  const tableData = useMemo(
    () =>
      metrics.map((item) => ({
        ...item,
        occupancy: item.capacity ? Math.round((item.averagePeople / item.capacity) * 100) : 0,
      })),
    [metrics]
  );

  const columns = [
    { key: "routeName" as const, label: "Ruta" },
    { key: "hour" as const, label: "Hora", render: (h: number) => `${h}:00` },
    { key: "averagePeople" as const, label: "Personas" },
    { key: "capacity" as const, label: "Capacidad" },
    {
      key: "occupancy" as const,
      label: "Ocupación (%)",
      render: (val: number) => `${val}%`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold gov-text-tertiary">Análisis de Ocupación</h2>
        <p className="gov-text-muted mt-1">Densidad de viajeros por hora en rutas principales</p>
      </div>

      <div className="gov-card p-6">
        <h3 className="text-lg font-semibold gov-text-tertiary mb-4">
          Ocupación Diaria{selectedRouteName ? ` - ${selectedRouteName}` : ""}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D6CABB" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="people"
              stroke="#7A1F2B"
              name="Personas a bordo"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="capacity"
              stroke="#B08A57"
              name="Capacidad"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold gov-text-tertiary">Datos Detallados de Ocupación</h3>
        <DataTable data={tableData} columns={columns} />
      </div>
    </div>
  );
}
