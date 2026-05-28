"use client";

import { DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { mockPotholes } from "@/lib/mockData";
import { AlertTriangle } from "lucide-react";

export default function PotholesPage() {
  const highSeverity = mockPotholes.filter((p) => p.severity === "high").length;
  const mediumSeverity = mockPotholes.filter((p) => p.severity === "medium").length;
  const totalPotholes = mockPotholes.reduce((sum, p) => sum + p.potholesCount, 0);

  const columns = [
    { key: "routeName" as const, label: "Ruta", width: "w-1/3" },
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
    { key: "lastReported" as const, label: "Última reportada" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Análisis de Baches</h2>
        <p className="text-gray-600 mt-1">Monitoreo de las rutas afectadas por daño vial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          label="Total de Baches"
          value={totalPotholes}
          icon={<AlertTriangle size={24} />}
        />
        <KPICard
          label="Rutas Críticas"
          value={highSeverity}
          change={-2}
          icon={<AlertTriangle size={24} className="text-red-500" />}
        />
        <KPICard
          label="Rutas con Severidad Media"
          value={mediumSeverity}
          icon={<AlertTriangle size={24} className="text-yellow-500" />}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Rutas Ordenadas por Cantidad de Baches</h3>
        <DataTable
          data={mockPotholes.sort((a, b) => b.potholesCount - a.potholesCount)}
          columns={columns}
        />
      </div>
    </div>
  );
}
