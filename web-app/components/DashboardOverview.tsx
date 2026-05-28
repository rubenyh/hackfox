"use client";

import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { mockRoutes, mockPotholes } from "@/lib/mockData";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";

export function DashboardOverview() {
  const totalBaches = mockPotholes.reduce((sum, p) => sum + p.potholesCount, 0);
  const avgOccupancy = Math.round(
    mockRoutes.reduce((sum, r) => sum + r.averageOccupancy, 0) / mockRoutes.length
  );
  const totalDailyTrips = mockRoutes.reduce((sum, r) => sum + r.dailyTrips, 0);

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
          value={mockRoutes.length}
          icon={<TrendingUp size={24} />}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold gov-text-tertiary">Rutas Principales</h3>
        <DataTable data={mockRoutes} columns={routeColumns} />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold gov-text-tertiary">Rutas con Más Baches</h3>
        <DataTable
          data={mockPotholes.slice(0, 5)}
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
