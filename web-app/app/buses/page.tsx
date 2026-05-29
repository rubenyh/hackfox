"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/firebase";
import { Bus, Route } from "@/lib/types";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function BusesPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [sortKey, setSortKey] = useState<keyof Bus>("plate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [plate, setPlate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [routeId, setRouteId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const busesRef = query(collection(db, "buses"), orderBy("plate"));
    const unsubBuses = onSnapshot(busesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Bus, "id">),
      }));
      setBuses(next);
    });

    const routesRef = query(collection(db, "routes"), orderBy("name"));
    const unsubRoutes = onSnapshot(routesRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Route, "id">),
      }));
      setRoutes(next);
    });

    return () => {
      unsubBuses();
      unsubRoutes();
    };
  }, []);

  const routeLookup = useMemo(() => {
    return routes.reduce<Record<string, Route>>((acc, route) => {
      acc[route.id] = route;
      return acc;
    }, {});
  }, [routes]);

  const sorted = useMemo(() => {
    return [...buses].sort((a, b) => {
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
  }, [buses, sortKey, sortDir]);

  const handleSort = (key: keyof Bus) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleCreateBus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!plate || !capacity) return;
    setIsSaving(true);
    try {
      const nextCapacity = Number(capacity);
      await addDoc(collection(db, "buses"), {
        plate: plate.trim(),
        capacity: Number.isFinite(nextCapacity) ? nextCapacity : 0,
        routeId: routeId || null,
        createdAt: serverTimestamp(),
      });
      setPlate("");
      setCapacity("");
      setRouteId("");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { key: "plate" as const, label: "Placa", sortable: true },
    { key: "capacity" as const, label: "Capacidad", sortable: true },
    {
      key: "routeId" as const,
      label: "Ruta asignada",
      render: (value: string | null) => {
        if (!value) return "Sin ruta";
        return routeLookup[value]?.name || value;
      },
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold gov-text-tertiary">Buses</h2>
          <p className="gov-text-muted mt-1">Inventario de buses registrados</p>
        </div>

        {isAdmin ? (
          <form onSubmit={handleCreateBus} className="gov-card space-y-4 p-6">
            <div>
              <h3 className="text-lg font-semibold gov-text-tertiary">Agregar bus</h3>
              <p className="gov-text-muted text-sm">Registra una nueva unidad de transporte.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="bus-plate">Placa</label>
                <input
                  id="bus-plate"
                  value={plate}
                  onChange={(event) => setPlate(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="ABC-123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium gov-text-tertiary" htmlFor="bus-capacity">Capacidad</label>
                <input
                  id="bus-capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium gov-text-tertiary" htmlFor="bus-route">Ruta asignada</label>
              <select
                id="bus-route"
                value={routeId}
                onChange={(event) => setRouteId(event.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">Sin ruta</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Guardando..." : "Agregar bus"}
            </button>
          </form>
        ) : (
          <div className="gov-card px-6 py-4 text-sm gov-text-muted">
            Solo administradores pueden crear buses.
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
