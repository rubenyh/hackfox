"use client";

import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { mockRoutes, mockPotholes } from "@/lib/mockData";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";

export default function Dashboard() {
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
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard General</h2>
        <p className="text-gray-600 mt-1">Resumen de estadísticas del transporte público</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <h3 className="text-xl font-bold text-gray-900">Rutas Principales</h3>
        <DataTable data={mockRoutes} columns={routeColumns} />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Rutas con Más Baches</h3>
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    value === "high"
                      ? "bg-red-100 text-red-800"
                      : value === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
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
