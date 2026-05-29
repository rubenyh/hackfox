"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DataTable } from "@/components/DataTable";
import { useEffect, useMemo, useState } from "react";
import { Route, RouteStop } from "@/lib/types";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/context/AuthContext";

export default function RoutesPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [routes, setRoutes] = useState<Route[]>([]);
  const [sortKey, setSortKey] = useState<keyof Route>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [routeName, setRouteName] = useState("");
  const [routeCity, setRouteCity] = useState("");
  const [routeKm, setRouteKm] = useState("");
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [stopRouteId, setStopRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [stopLat, setStopLat] = useState("");
  const [stopLng, setStopLng] = useState("");
  const [isSavingStop, setIsSavingStop] = useState(false);

  useEffect(() => {
    const routesRef = query(collection(db, "routes"), orderBy("name"));
    const unsubscribe = onSnapshot(routesRef, (snapshot) => {
      const nextRoutes = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Route, "id">;
        return {
          id: doc.id,
          ...data,
        } as Route;
      });
      setRoutes(nextRoutes);
    });

    return () => unsubscribe();
  }, []);

  const sorted = useMemo(() => {
    return [...routes].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "string" || typeof bVal === "string") return 0;
      const cmp = (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [routes, sortKey, sortDir]);

  const handleCreateRoute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!routeName || !routeCity || !routeKm) return;
    setIsSavingRoute(true);
    try {
      const totalKm = Number(routeKm);
      await addDoc(collection(db, "routes"), {
        name: routeName.trim(),
        city: routeCity.trim(),
        totalKm: Number.isFinite(totalKm) ? totalKm : 0,
        potholeCount: 0,
        averageOccupancy: 0,
        dailyTrips: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setRouteName("");
      setRouteCity("");
      setRouteKm("");
    } finally {
      setIsSavingRoute(false);
    }
  };

  const handleCreateStop = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stopRouteId || !stopId || !stopLat || !stopLng) return;
    setIsSavingStop(true);
    try {
      const lat = Number(stopLat);
      const lng = Number(stopLng);
      const payload: Omit<RouteStop, "id"> = {
        routeId: stopRouteId,
        stopId: stopId.trim(),
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
      };
      await addDoc(collection(db, "routeStops"), payload);
      setStopRouteId("");
      setStopId("");
      setStopLat("");
      setStopLng("");
    } finally {
      setIsSavingStop(false);
    }
  };

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
    <ProtectedRoute>
      <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold gov-text-tertiary">Estadisticas de Rutas</h2>
        <p className="gov-text-muted mt-1">Detalles de todas las rutas de transporte</p>
      </div>

      {isAdmin ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCreateRoute} className="gov-card space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold gov-text-tertiary">Agregar ruta</h3>
              <p className="gov-text-muted text-sm">Crea una nueva ruta operativa.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="route-name">Nombre</label>
                <input
                  id="route-name"
                  value={routeName}
                  onChange={(event) => setRouteName(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Ruta Centro - Norte"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="route-city">Ciudad</label>
                <input
                  id="route-city"
                  value={routeCity}
                  onChange={(event) => setRouteCity(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Bogota"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium gov-text-tertiary" htmlFor="route-km">Distancia total (km)</label>
              <input
                id="route-km"
                type="number"
                min="0"
                step="0.1"
                value={routeKm}
                onChange={(event) => setRouteKm(event.target.value)}
                required
                className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="25.5"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingRoute}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingRoute ? "Guardando..." : "Agregar ruta"}
            </button>
          </form>

          <form onSubmit={handleCreateStop} className="gov-card space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold gov-text-tertiary">Agregar parada</h3>
              <p className="gov-text-muted text-sm">Registra paradas con coordenadas geograficas.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium gov-text-tertiary" htmlFor="stop-route">Ruta</label>
              <select
                id="stop-route"
                value={stopRouteId}
                onChange={(event) => setStopRouteId(event.target.value)}
                required
                className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">Selecciona una ruta</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="stop-id">ID de parada</label>
                <input
                  id="stop-id"
                  value={stopId}
                  onChange={(event) => setStopId(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="ST-001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="stop-lat">Latitud</label>
                <input
                  id="stop-lat"
                  type="number"
                  step="0.000001"
                  value={stopLat}
                  onChange={(event) => setStopLat(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="4.7110"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="stop-lng">Longitud</label>
                <input
                  id="stop-lng"
                  type="number"
                  step="0.000001"
                  value={stopLng}
                  onChange={(event) => setStopLng(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="-74.0721"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingStop}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingStop ? "Guardando..." : "Agregar parada"}
            </button>
          </form>
        </div>
      ) : (
        <div className="gov-card px-6 py-4 text-sm gov-text-muted">
          Solo administradores pueden crear rutas o paradas.
        </div>
      )}

      <DataTable
        data={sorted}
        columns={columns}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDir}
      />
      </div>
    </ProtectedRoute>
  );
}
