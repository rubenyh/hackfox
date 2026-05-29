"use client";

import { KPICard } from "@/components/KPICard";
import { GoogleHeatmap } from "@/components/analytics/GoogleHeatmap";
import { app, db } from "@/lib/firebase/firebase";
import { ReportData } from "@/lib/types";
import { AlertTriangle, Clock3, ExternalLink, Map as MapIcon, MapPin, X } from "lucide-react";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function PotholesPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [deviceReports, setDeviceReports] = useState<DeviceReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DisplayReport | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeStatus, setActiveStatus] = useState<ReportStatusKey>("pending");
  const [activeSource, setActiveSource] = useState<ReportSourceFilter>("all");

  useEffect(() => {
    const reportsRef = collection(db, "reports");
    const unsubscribe = onSnapshot(reportsRef, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ReportData, "id">),
      }));
      setReports(next);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const realtimeDb = getDatabase(
      app,
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://hackfox-default-rtdb.firebaseio.com"
    );

    let rootReports: DeviceReport[] = [];
    let nestedReports: DeviceReport[] = [];
    let rootReportsWithStatus: DeviceReport[] = [];
    let nestedReportsWithStatus: DeviceReport[] = [];

    const pushMergedReports = () => {
      const mergedById = new Map<string, DeviceReport>();
      [...rootReports, ...nestedReports, ...rootReportsWithStatus, ...nestedReportsWithStatus].forEach((report) => {
        mergedById.set(report.id, report);
      });
      setDeviceReports(Array.from(mergedById.values()));
    };

    const unsubscribeRoot = onValue(ref(realtimeDb, "reportes"), (snapshot) => {
      rootReports = parseRealtimeReports(snapshot.val(), "reportes");
      pushMergedReports();
    });

    const unsubscribeNested = onValue(ref(realtimeDb, "data/reportes"), (snapshot) => {
      nestedReports = parseRealtimeReports(snapshot.val(), "data/reportes");
      pushMergedReports();
    });

    const unsubscribeRootWithStatus = onValue(ref(realtimeDb, "reportes_status"), (snapshot) => {
      rootReportsWithStatus = parseRealtimeReports(snapshot.val(), "reportes_status");
      pushMergedReports();
    });

    const unsubscribeNestedWithStatus = onValue(ref(realtimeDb, "data/reportes_status"), (snapshot) => {
      nestedReportsWithStatus = parseRealtimeReports(snapshot.val(), "data/reportes_status");
      pushMergedReports();
    });

    return () => {
      unsubscribeRoot();
      unsubscribeNested();
      unsubscribeRootWithStatus();
      unsubscribeNestedWithStatus();
    };
  }, []);

  const normalizedReports = useMemo<DisplayReport[]>(() => {
    const userReports: DisplayReport[] = reports.map((report) => ({
      ...report,
      source: "user",
      sourceLabel: "Usuario",
      sourceId: report.userId || report.id,
    }));

    const realtimeReports: DisplayReport[] = deviceReports.map((report) => ({
      id: report.id,
      incidentType: normalizeIncidentType(report.tipo),
      description: "Reporte detectado por dispositivo en tiempo real",
      latitude: report.lat,
      longitude: report.lng,
      createdAt: report.ts,
      status: report.status || "pending",
      source: "device",
      sourceLabel: "Dispositivo",
      sourceId: report.id,
      intensity: report.intensidad,
      devicePath: report.path,
    }));

    return [...userReports, ...realtimeReports];
  }, [reports, deviceReports]);

  const sourceTabs = useMemo(
    () => [
      { key: "all" as const, label: "Todos", count: normalizedReports.length },
      {
        key: "user" as const,
        label: "Usuario",
        count: normalizedReports.filter((report) => report.source === "user").length,
      },
      {
        key: "device" as const,
        label: "Dispositivo",
        count: normalizedReports.filter((report) => report.source === "device").length,
      },
    ],
    [normalizedReports]
  );

  const userReports = useMemo(
    () => normalizedReports.filter((report) => report.source === "user"),
    [normalizedReports]
  );

  const statusTabs = useMemo(
    () => [
      { key: "pending" as const, label: "Pendientes", count: userReports.filter((report) => report.status === "pending").length },
      { key: "resolved" as const, label: "Resueltos", count: userReports.filter((report) => report.status === "resolved").length },
      {
        key: "no-clasifica" as const,
        label: "No clasifica",
        count: userReports.filter((report) => report.status === "no-clasifica").length,
      },
    ],
    [userReports]
  );

  const userVisibleReports = useMemo(
    () =>
      normalizedReports
        .filter((report) => report.source === "user" && report.status === activeStatus)
        .sort((a, b) => getReportTime(b.createdAt) - getReportTime(a.createdAt)),
    [normalizedReports, activeStatus]
  );

  const deviceVisibleReports = useMemo(
    () =>
      normalizedReports
        .filter((report) => report.source === "device" && report.status === activeStatus)
        .sort((a, b) => getReportTime(b.createdAt) - getReportTime(a.createdAt)),
    [normalizedReports, activeStatus]
  );

  const reportsForMap = useMemo(() => {
    if (activeSource === "user") {
      return userVisibleReports;
    }
    if (activeSource === "device") {
      return deviceVisibleReports;
    }
    return [...userVisibleReports, ...deviceVisibleReports].sort(
      (a, b) => getReportTime(b.createdAt) - getReportTime(a.createdAt)
    );
  }, [activeSource, userVisibleReports, deviceVisibleReports]);

  const reportsWithLocation = useMemo(
    () =>
      reportsForMap.filter(
        (report) => Number.isFinite(report.latitude) && Number.isFinite(report.longitude)
      ),
    [reportsForMap]
  );

  const heatmapPoints = useMemo(
    () =>
      reportsWithLocation.map((report) => ({
        location: { lat: report.latitude, lng: report.longitude },
        weight: report.source === "device" ? Math.max(1, report.intensity || 1) : report.status === "pending" ? 3 : 1,
      })),
    [reportsWithLocation]
  );

  const heatmapCenter = useMemo(() => {
    if (!reportsWithLocation.length) {
      return { lat: 4.711, lng: -74.0721 };
    }

    const totals = reportsWithLocation.reduce(
      (acc, report) => ({
        lat: acc.lat + report.latitude,
        lng: acc.lng + report.longitude,
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: totals.lat / reportsWithLocation.length,
      lng: totals.lng / reportsWithLocation.length,
    };
  }, [reportsWithLocation]);

  const totalReports = normalizedReports.length;
  const pendingCount = normalizedReports.filter((report) => report.status === "pending").length;
  const deviceCount = normalizedReports.filter((report) => report.source === "device").length;

  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const selectedReportCenter = selectedReport
    ? { lat: selectedReport.latitude, lng: selectedReport.longitude }
    : null;

  const formatReportDate = (value: ReportData["createdAt"]) => {
    const date = getReportDate(value);
    if (!date) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold gov-text-tertiary">Reportes en mapa</h2>
        <p className="gov-text-muted mt-1">Seguimiento en tiempo real de reportes con ubicación y evidencia adjunta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          label="Reportes totales"
          value={totalReports}
          icon={<AlertTriangle size={24} />}
        />
        <KPICard
          label="Pendientes"
          value={pendingCount}
          icon={<Clock3 size={24} className="gov-text-primary" />}
        />
        <KPICard
          label="Reportes por dispositivo"
          value={deviceCount}
          icon={<MapPin size={24} className="gov-text-accent" />}
        />
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
        {sourceTabs.map((tab) => {
          const isActive = activeSource === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSource(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              {tab.label} <span className="ml-1 text-xs opacity-80">({tab.count})</span>
            </button>
          );
        })}
      </div>

      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-semibold gov-text-tertiary">Mapa de reportes</h3>
            <p className="gov-text-muted text-sm">Incluye reportes de usuario y detecciones de dispositivo de Realtime Database.</p>
          </div>
          <MapIcon size={20} className="gov-text-accent" />
        </div>

        <div className="analytics-map analytics-map-live min-h-105">
          {mapApiKey && heatmapPoints.length > 0 ? (
            <GoogleHeatmap apiKey={mapApiKey} points={heatmapPoints} center={heatmapCenter} />
          ) : (
            <div className="analytics-map-fallback">
              {mapApiKey ? "Sin reportes con ubicación para el filtro seleccionado" : "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {activeSource !== "device" ? (
          <section className="space-y-4">
            <div>
              <h3 className="text-xl font-bold gov-text-tertiary">Reportado por usuarios</h3>
              <p className="gov-text-muted text-sm">Colección Firestore de reportes creados por usuarios. El filtro de estado también aplica a dispositivos.</p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
              {statusTabs.map((tab) => {
                const isActive = activeStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveStatus(tab.key)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-transparent text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    {tab.label} <span className="ml-1 text-xs opacity-80">({tab.count})</span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {userVisibleReports.length ? (
                userVisibleReports.map((report) => (
                  <button
                    key={report.id || `${report.latitude}-${report.longitude}-${report.createdAt}`}
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="gov-card overflow-hidden text-left transition-transform hover:-translate-y-1"
                  >
                    {report.imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden bg-slate-100">
                        <img
                          src={report.imageUrl}
                          alt={report.incidentType || "Imagen del reporte"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm gov-text-muted">
                        Sin imagen adjunta
                      </div>
                    )}

                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">{formatReportStatus(report.status)}</p>
                          <h4 className="mt-1 text-lg font-semibold gov-text-tertiary">{report.incidentType || "Reporte sin tipo"}</h4>
                        </div>
                        <span className={`gov-badge px-3 py-1 text-xs uppercase ${getStatusBadgeClass(report.status)}`}>
                          {formatReportStatus(report.status)}
                        </span>
                      </div>

                      <p className="gov-text-muted text-sm leading-6">{report.description || "Sin descripción disponible"}</p>

                      <div className="grid gap-2 text-sm gov-text-muted">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="gov-text-accent" />
                          <span>{report.incidentType || "Sin tipo de incidente"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="gov-text-accent" />
                          <span>{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 size={16} className="gov-text-accent" />
                          <span>{formatReportDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="gov-card p-6 gov-text-muted">No hay reportes {formatReportStatus(activeStatus).toLowerCase()} de usuarios.</div>
              )}
            </div>
          </section>
        ) : null}

        {activeSource !== "user" ? (
          <section className="space-y-4">
            <div>
              <h3 className="text-xl font-bold gov-text-tertiary">Detectado por dispositivo físico</h3>
              <p className="gov-text-muted text-sm">Colección de Realtime Database. Estos registros no incluyen imagen.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {deviceVisibleReports.length ? (
                deviceVisibleReports.map((report) => (
                  <button
                    key={report.id || `${report.latitude}-${report.longitude}-${report.createdAt}`}
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="gov-card p-5 text-left transition-transform hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">{formatReportStatus(report.status)}</p>
                          <h4 className="mt-1 text-lg font-semibold gov-text-tertiary">{report.incidentType || "Reporte sin tipo"}</h4>
                          <p className="mt-1 text-xs gov-text-muted">Fuente: Dispositivo</p>
                        </div>
                        <span className={`gov-badge px-3 py-1 text-xs uppercase ${getStatusBadgeClass(report.status)}`}>
                          {formatReportStatus(report.status)}
                        </span>
                      </div>

                      <p className="gov-text-muted text-sm leading-6">{report.description || "Sin descripción disponible"}</p>

                      <div className="grid gap-2 text-sm gov-text-muted">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="gov-text-accent" />
                          <span>{report.incidentType || "Sin tipo de incidente"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="gov-text-accent" />
                          <span>{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 size={16} className="gov-text-accent" />
                          <span>{formatReportDate(report.createdAt)}</span>
                        </div>
                        {typeof report.intensity === "number" ? (
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="gov-text-accent" />
                            <span>Intensidad: {report.intensity.toFixed(3)}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="gov-card p-6 gov-text-muted">No hay reportes de dispositivo físico para mostrar.</div>
              )}
            </div>
          </section>
        ) : null}
      </div>

      {selectedReport && selectedReportCenter ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-3 py-3 sm:items-center sm:px-4 sm:py-6" onClick={() => setSelectedReport(null)}>
          <div
            className="gov-card relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden p-0 shadow-2xl sm:max-w-3xl lg:max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b gov-border px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Detalle del reporte</p>
                <h3 className="mt-1 text-lg font-semibold gov-text-tertiary sm:text-xl">{selectedReport.incidentType || "Reporte sin tipo"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 sm:h-9 sm:w-9"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 p-4 sm:p-5">
                <div className="analytics-map analytics-map-live min-h-56 overflow-hidden rounded-2xl sm:min-h-64 lg:min-h-72">
                  {mapApiKey ? (
                    <GoogleHeatmap
                      apiKey={mapApiKey}
                      points={[{ location: selectedReportCenter, weight: 5 }]}
                      center={selectedReportCenter}
                    />
                  ) : (
                    <div className="analytics-map-fallback">Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</div>
                  )}
                </div>

                <div className="grid gap-3 text-sm gov-text-muted sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Ubicación</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-wrap gov-text-tertiary sm:text-base">
                      <MapPin size={16} className="gov-text-accent" />
                      {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Estado</p>
                    <p className="mt-2 text-sm font-semibold gov-text-tertiary sm:text-base">{formatReportStatus(selectedReport.status)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Tipo de incidente</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold gov-text-tertiary sm:text-base">
                      <AlertTriangle size={16} className="gov-text-accent" />
                      {selectedReport.incidentType || "Sin tipo de incidente"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Descripción</p>
                  <p className="mt-2 text-sm leading-6 gov-text-tertiary">
                    {selectedReport.description || "Sin descripción disponible"}
                  </p>
                </div>

                {selectedReport.imageUrl ? (
                  <div className="overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={selectedReport.imageUrl}
                      alt={selectedReport.incidentType || "Imagen del reporte"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <div className="border-t lg:border-l lg:border-t-0 gov-border bg-slate-50 p-4 space-y-4 sm:p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Acciones</p>
                  <p className="mt-2 text-sm gov-text-muted">
                    Cambia el estado del reporte desde este panel.
                  </p>
                </div>

                {selectedReport.source === "user" ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => window.open(buildGoogleMapsUrl(selectedReport.latitude, selectedReport.longitude), "_blank", "noopener,noreferrer")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:py-3"
                  >
                    <ExternalLink size={16} />
                    Abrir en Maps
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedReport, "resolved")}
                    className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                  >
                    Marcar como resuelto
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedReport, "no-clasifica")}
                    className="flex w-full items-center justify-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                  >
                    Marcar como no clasifica
                  </button>
                </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => window.open(buildGoogleMapsUrl(selectedReport.latitude, selectedReport.longitude), "_blank", "noopener,noreferrer")}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:py-3"
                    >
                      <ExternalLink size={16} />
                      Abrir en Maps
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(selectedReport, "resolved")}
                      className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                    >
                      Marcar como resuelto
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(selectedReport, "no-clasifica")}
                      className="flex w-full items-center justify-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                    >
                      Marcar como no clasifica
                    </button>

                    <div className="rounded-2xl bg-white p-4 text-sm gov-text-muted shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Origen de datos</p>
                      <p className="mt-2 text-sm gov-text-tertiary">Reporte generado por dispositivo desde Realtime Database.</p>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-white p-4 text-sm gov-text-muted shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Fecha</p>
                  <p className="mt-2 text-sm gov-text-tertiary">{formatReportDate(selectedReport.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  async function handleStatusChange(report: DisplayReport | null, status: "resolved" | "no-clasifica") {
    if (!report?.id) return;
    setIsUpdating(true);
    try {
      if (report.source === "user") {
        await updateDoc(doc(db, "reports", report.id), { status });
      } else {
        const realtimeDb = getDatabase(
          app,
          process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://hackfox-default-rtdb.firebaseio.com"
        );

        const sourcePath = report.devicePath || `reportes/${report.id}`;
        await update(ref(realtimeDb, sourcePath), { status });

        const statusPath = getDeviceStatusPath(sourcePath, report.id);
        await update(ref(realtimeDb, statusPath), {
          lat: report.latitude,
          lng: report.longitude,
          intensidad: report.intensity ?? null,
          tipo: report.incidentType || "bache",
          ts: typeof report.createdAt === "string" ? report.createdAt : null,
          status,
        });

        setDeviceReports((current) =>
          current.map((item) => (item.id === report.id ? { ...item, status } : item))
        );
      }

      setSelectedReport((current) => (current && current.id === report.id ? { ...current, status } : current));
    } finally {
      setIsUpdating(false);
    }
  }
}

type ReportStatusKey = "pending" | "resolved" | "no-clasifica";
type ReportSource = "user" | "device";
type ReportSourceFilter = "all" | ReportSource;

type DeviceReport = {
  id: string;
  lat: number;
  lng: number;
  intensidad?: number;
  tipo?: string;
  ts?: string;
  status?: string;
  path: string;
};

type DisplayReport = ReportData & {
  source: ReportSource;
  sourceLabel: string;
  sourceId?: string;
  intensity?: number;
  devicePath?: string;
};

function parseRealtimeReports(value: unknown, basePath: string): DeviceReport[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const rows: DeviceReport[] = [];

  Object.entries(value as Record<string, unknown>).forEach(([id, entry]) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const row = entry as Record<string, unknown>;
    const lat = Number(row.lat);
    const lng = Number(row.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    const intensidadValue = Number(row.intensidad);
    rows.push({
      id,
      lat,
      lng,
      intensidad: Number.isFinite(intensidadValue) ? intensidadValue : undefined,
      tipo: typeof row.tipo === "string" ? row.tipo : undefined,
      ts: typeof row.ts === "string" ? row.ts : undefined,
      status: typeof row.status === "string" ? row.status : undefined,
      path: `${basePath}/${id}`,
    });
  });

  return rows;
}

function normalizeIncidentType(value: string | undefined) {
  if (!value) return "Bache";
  if (value.toLowerCase() === "bache") return "Bache";
  return value;
}

function getReportTime(value: ReportData["createdAt"]) {
  const date = getReportDate(value);
  return date ? date.getTime() : 0;
}

function getReportDate(value: ReportData["createdAt"]) {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const parsed = value.toDate();
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }
  return null;
}

function formatReportStatus(status: string) {
  if (status === "pending") return "Pendiente";
  if (status === "resolved") return "Resuelto";
  if (status === "no-clasifica") return "No clasifica";
  return status;
}

function getStatusBadgeClass(status: string) {
  if (status === "pending") return "gov-badge-medium";
  if (status === "resolved") return "gov-badge-low";
  if (status === "no-clasifica") return "gov-badge-high";
  return "gov-badge-medium";
}

function buildGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function getDeviceStatusPath(sourcePath: string, id: string) {
  if (sourcePath.startsWith("data/")) {
    return `data/reportes_status/${id}`;
  }
  return `reportes_status/${id}`;
}
