"use client";

import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { db } from "@/lib/firebase/firebase";
import { PotholeData, Route } from "@/lib/types";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export function DashboardOverview() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [potholes, setPotholes] = useState<PotholeData[]>([]);

  useEffect(() => {
    const routesRef = query(collection(db, "routes"), orderBy("name"));
    const potholesRef = query(collection(db, "potholes"), orderBy("potholesCount", "desc"));

    const unsubRoutes = onSnapshot(routesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Route, "id">),
      }));
      setRoutes(next);
    });

    const unsubPotholes = onSnapshot(potholesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        ...(doc.data() as PotholeData),
      }));
      setPotholes(next);
    });

    return () => {
      unsubRoutes();
      unsubPotholes();
    };
  }, []);

  const totalBaches = useMemo(
    () => potholes.reduce((sum, p) => sum + p.potholesCount, 0),
    [potholes]
  );

  const avgOccupancy = useMemo(() => {
    if (routes.length === 0) return 0;
    return Math.round(
      routes.reduce((sum, r) => sum + r.averageOccupancy, 0) / routes.length
    );
  }, [routes]);

  const totalDailyTrips = useMemo(
    () => routes.reduce((sum, r) => sum + r.dailyTrips, 0),
    [routes]
  );

  const routeColumns = [
    { key: "name" as const, label: "Ruta", width: "w-1/4" },
    { key: "potholeCount" as const, label: "Baches", width: "w-1/6" },
    { key: "averageOccupancy" as const, label: "Ocupación (%)", width: "w-1/6" },
    { key: "dailyTrips" as const, label: "Viajes/día", width: "w-1/6" },
    {
      key: "lastUpdated" as const,
      label: "Última actualización",
      render: (value: string) => {
        const date = new Date(value);
        return `${date.getHours().toString().padStart(2, "0")}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold gov-text-tertiary">Dashboard General</h2>
        <p className="gov-text-muted mt-1">Resumen de estadísticas del transporte público</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total de Baches"
          value={totalBaches}
          change={12}
          icon={<AlertTriangle size={24} />}
        />
        <KPICard
          label="Ocupación Promedio"
          value={`${avgOccupancy}%`}
          change={-5}
          icon={<Users size={24} />}
        />
        <KPICard
          label="Viajes Diarios"
          value={totalDailyTrips}
          change={8}
          icon={<TrendingUp size={24} />}
        />
        <KPICard
          label="Rutas Activas"
          value={routes.length}
          icon={<TrendingUp size={24} />}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold gov-text-tertiary">Rutas Principales</h3>
        <DataTable data={routes} columns={routeColumns} />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold gov-text-tertiary">Rutas con Más Baches</h3>
        <DataTable
          data={potholes.slice(0, 5)}
          columns={[
            { key: "routeName" as const, label: "Ruta" },
            { key: "potholesCount" as const, label: "Cantidad de Baches" },
            {
              key: "severity" as const,
              label: "Severidad",
              render: (value: string) => (
                <span
                  className={`px-3 py-1 text-xs gov-badge ${
                    value === "high"
                      ? "gov-badge-high"
                      : value === "medium"
                      ? "gov-badge-medium"
                      : "gov-badge-low"
                  }`}
                >
                  {value === "high" ? "Alta" : value === "medium" ? "Media" : "Baja"}
                </span>
              ),
            },
            {
              key: "lastReported" as const,
              label: "Última reportada",
            },
          ]}
        />
      </div>
    </div>
  );
}
