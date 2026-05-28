"use client";

import { DataTable } from "@/components/DataTable";
import { mockOccupancy } from "@/lib/mockData";
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

export default function OccupancyPage() {
  const chartData = [
    { hour: "6:00", people: 25, capacity: 80 },
    { hour: "7:00", people: 62, capacity: 80 },
    { hour: "8:00", people: 78, capacity: 80 },
    { hour: "9:00", people: 55, capacity: 80 },
    { hour: "17:00", people: 72, capacity: 80 },
    { hour: "18:00", people: 80, capacity: 80 },
    { hour: "19:00", people: 68, capacity: 80 },
    { hour: "20:00", people: 42, capacity: 80 },
  ];

  const tableData = mockOccupancy.map(item => ({
    ...item,
    occupancy: Math.round((item.averagePeople / item.capacity) * 100)
  }));

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
        <h2 className="text-3xl font-bold text-gray-900">Análisis de Ocupación</h2>
        <p className="text-gray-600 mt-1">Densidad de viajeros por hora en rutas principales</p>
      </div>

      <div className="bg-white rounded-lg border border-blue-200 p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocupación Diaria - Ruta Centro - Norte</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="people"
              stroke="#2563eb"
              name="Personas a bordo"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="capacity"
              stroke="#cbd5e1"
              name="Capacidad"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Datos Detallados de Ocupación</h3>
        <DataTable data={tableData} columns={columns} />
      </div>
    </div>
  );
}
