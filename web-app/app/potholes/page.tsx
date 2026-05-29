"use client";

import { KPICard } from "@/components/KPICard";
import { GoogleHeatmap } from "@/components/analytics/GoogleHeatmap";
import { db } from "@/lib/firebase/firebase";
import { ReportData } from "@/lib/types";
import { AlertTriangle, Clock3, ExternalLink, Image as ImageIcon, Map, MapPin, X } from "lucide-react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function PotholesPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeStatus, setActiveStatus] = useState<ReportStatusKey>("pending");

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

  const statusTabs = useMemo(
    () => [
      { key: "pending" as const, label: "Pendientes", count: reports.filter((report) => report.status === "pending").length },
      { key: "resolved" as const, label: "Resueltos", count: reports.filter((report) => report.status === "resolved").length },
      {
        key: "no-clasifica" as const,
        label: "No clasifica",
        count: reports.filter((report) => report.status === "no-clasifica").length,
      },
    ],
    [reports]
  );

  const visibleReports = useMemo(
    () =>
      [...reports]
        .filter((report) => report.status === activeStatus)
        .sort((a, b) => getReportTime(b.createdAt) - getReportTime(a.createdAt)),
    [reports, activeStatus]
  );

  const reportsWithLocation = useMemo(
    () =>
      reports.filter(
        (report) => Number.isFinite(report.latitude) && Number.isFinite(report.longitude)
      ),
    [reports]
  );

  const heatmapPoints = useMemo(
    () =>
      reportsWithLocation.map((report) => ({
        location: { lat: report.latitude, lng: report.longitude },
        weight: report.status === "pending" ? 3 : 1,
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

  const totalReports = reports.length;
  const pendingCount = reports.filter((report) => report.status === "pending").length;
  const withImageCount = useMemo(
    () => reports.filter((report) => Boolean(report.imageUrl)).length,
    [reports]
  );

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
          label="Con imagen"
          value={withImageCount}
          icon={<ImageIcon size={24} className="gov-text-accent" />}
        />
      </div>

      <div className="gov-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-semibold gov-text-tertiary">Mapa de reportes</h3>
            <p className="gov-text-muted text-sm">Los círculos más intensos representan reportes pendientes con ubicación válida.</p>
          </div>
          <Map size={20} className="gov-text-accent" />
        </div>

        <div className="analytics-map analytics-map-live min-h-105">
          {mapApiKey && heatmapPoints.length > 0 ? (
            <GoogleHeatmap apiKey={mapApiKey} points={heatmapPoints} center={heatmapCenter} />
          ) : (
            <div className="analytics-map-fallback">
              {mapApiKey ? "Sin reportes con ubicación para mostrar" : "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold gov-text-tertiary">Reportes por estado</h3>
          <p className="gov-text-muted text-sm">Usa las pestañas para cambiar entre pendientes, resueltos y no clasifica.</p>
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
          {visibleReports.length ? (
            visibleReports.map((report) => (
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
            <div className="gov-card p-6 gov-text-muted">No hay reportes {formatReportStatus(activeStatus).toLowerCase()} con información disponible.</div>
          )}
        </div>
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
                    onClick={() => handleStatusChange(selectedReport.id, "resolved")}
                    className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                  >
                    Marcar como resuelto
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedReport.id, "no-clasifica")}
                    className="flex w-full items-center justify-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
                  >
                    Marcar como no clasifica
                  </button>
                </div>

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

  async function handleStatusChange(reportId: string | undefined, status: "resolved" | "no-clasifica") {
    if (!reportId) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "reports", reportId), { status });
      setSelectedReport((current) => (current && current.id === reportId ? { ...current, status } : current));
    } finally {
      setIsUpdating(false);
    }
  }
}

type ReportStatusKey = "pending" | "resolved" | "no-clasifica";

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
