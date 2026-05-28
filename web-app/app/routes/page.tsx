"use client";

import { DataTable } from "@/components/DataTable";
import { mockRoutes } from "@/lib/mockData";
import { useState } from "react";
import { Route } from "@/lib/types";

export default function RoutesPage() {
  const [sortKey, setSortKey] = useState<keyof Route>("potholeCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...mockRoutes].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string") return 0;
    const cmp = (aVal as number) - (bVal as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: keyof Route) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const columns = [
    { key: "name" as const, label: "Ruta", sortable: true },
    { key: "city" as const, label: "Ciudad", sortable: true },
    { key: "totalKm" as const, label: "Distancia (km)", sortable: true },
    { key: "potholeCount" as const, label: "Baches", sortable: true },
    { key: "averageOccupancy" as const, label: "Ocupación (%)", sortable: true },
    { key: "dailyTrips" as const, label: "Viajes/día", sortable: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold gov-text-tertiary">Estadísticas de Rutas</h2>
        <p className="gov-text-muted mt-1">Detalles de todas las rutas de transporte</p>
      </div>

      <DataTable
        data={sorted}
        columns={columns}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDir}
      />
    </div>
  );
}
