"use client";

import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { db } from "@/lib/firebase/firebase";
import { PotholeData, Route } from "@/lib/types";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";
import { collection, onSnapshot, orderBy, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export function DashboardOverview() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [potholes, setPotholes] = useState<PotholeData[]>([]);
  const [bachesChange, setBachesChange] = useState<number | undefined>(undefined);
  const [occupancyChange, setOccupancyChange] = useState<number | undefined>(undefined);
  const [tripsChange, setTripsChange] = useState<number | undefined>(undefined);
  const [routesChange, setRoutesChange] = useState<number | undefined>(undefined);

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



  // Try to compute week-over-week changes using a `kpiSnapshots` collection
  // Expected snapshot document shape (optional):
  // { timestamp: Timestamp, totalBaches: number, avgOccupancy: number, totalDailyTrips: number, routesActive: number }
  useEffect(() => {
    const computePct = (curr: number, prev: number | undefined) => {
      if (prev === undefined || prev === null) return undefined;
      if (prev === 0) return curr === 0 ? 0 : 100;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const calcFromSnapshots = async () => {
      try {
        const now = new Date();
        const lookback = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000); // last 3 weeks
        const snapsRef = collection(db, "kpiSnapshots");
        const q = query(snapsRef, where("timestamp", ">=", Timestamp.fromDate(lookback)), orderBy("timestamp", "desc"));
        const snapDocs = await getDocs(q);
        if (snapDocs.empty) return false;

        // map docs to {id, ts, data}
        const snaps = snapDocs.docs.map((d) => ({
          id: d.id,
          ts: (d.data().timestamp as Timestamp) || null,
          data: d.data(),
        })).filter(s => s.ts);

        if (!snaps.length) return false;

        // pick latest and the one closest to 7 days ago
        const latest = snaps[0];
        const target = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
        let closest = snaps[0];
        let minDiff = Math.abs((snaps[0].ts as Timestamp).toDate().getTime() - target);
        for (let i = 1; i < snaps.length; i++) {
          const diff = Math.abs((snaps[i].ts as Timestamp).toDate().getTime() - target);
          if (diff < minDiff) {
            minDiff = diff;
            closest = snaps[i];
          }
        }

        const prevData = closest.data || {};
        const currData = latest.data || {};

        // Prefer comparing current live values (calculated above) to prev snapshot
        setBachesChange(() => computePct(totalBaches, prevData.totalBaches));
        setOccupancyChange(() => computePct(avgOccupancy, prevData.avgOccupancy));
        setTripsChange(() => computePct(totalDailyTrips, prevData.totalDailyTrips));
        setRoutesChange(() => computePct(routes.length, prevData.routesActive));

        return true;
      } catch (err) {
        return false;
      }
    };

    const fallbackBaches = async () => {
      try {
        const now = new Date();
        const endCurrent = now;
        const startCurrent = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startPrev = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const endPrev = startCurrent;

        const reportsRef = collection(db, "reports");

        const qCurrent = query(
          reportsRef,
          where("createdAt", ">=", Timestamp.fromDate(startCurrent)),
          where("createdAt", "<", Timestamp.fromDate(endCurrent))
        );

        const qPrev = query(
          reportsRef,
          where("createdAt", ">=", Timestamp.fromDate(startPrev)),
          where("createdAt", "<", Timestamp.fromDate(endPrev))
        );

        const [snapCurrent, snapPrev] = await Promise.all([getDocs(qCurrent), getDocs(qPrev)]);

        const countCurrent = snapCurrent.docs.filter((d) => {
          const data = d.data();
          const t = String(data.incidentType || "").toLowerCase();
          return t.includes("bache") || t.includes("daño");
        }).length;

        const countPrev = snapPrev.docs.filter((d) => {
          const data = d.data();
          const t = String(data.incidentType || "").toLowerCase();
          return t.includes("bache") || t.includes("daño");
        }).length;

        if (countPrev === 0 && countCurrent === 0) {
          setBachesChange(0);
        } else if (countPrev === 0) {
          setBachesChange(100);
        } else {
          const pct = Math.round(((countCurrent - countPrev) / countPrev) * 100);
          setBachesChange(pct);
        }
      } catch (err) {
        setBachesChange(undefined);
      }
    };

    (async () => {
      const ok = await calcFromSnapshots();
      if (!ok) {
        // no snapshots available — compute only baches from reports as fallback
        await fallbackBaches();
        setOccupancyChange(undefined);
        setTripsChange(undefined);
        setRoutesChange(undefined);
      }
    })();
  }, [potholes, routes, totalBaches, avgOccupancy, totalDailyTrips]);

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
          change={bachesChange}
          icon={<AlertTriangle size={24} />}
        />
        <KPICard
          label="Ocupación Promedio"
          value={`${avgOccupancy}%`}
          change={occupancyChange}
          icon={<Users size={24} />}
        />
        <KPICard
          label="Viajes Diarios"
          value={totalDailyTrips}
          change={tripsChange}
          icon={<TrendingUp size={24} />}
        />
        <KPICard
          label="Rutas Activas"
          value={routes.length}
          change={routesChange}
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
