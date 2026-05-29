"use client";

import { Map } from "lucide-react";
import type { DemandHighlights, HeatmapPoint } from "@/components/analytics/types";
import { GoogleHeatmap } from "@/components/analytics/GoogleHeatmap";

type DemandHeatmapsCardProps = {
  highlights: DemandHighlights;
  points: HeatmapPoint[];
  center: { lat: number; lng: number };
};

export function DemandHeatmapsCard({ highlights, points, center }: DemandHeatmapsCardProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const showMap = apiKey && points.length > 0;

  return (
    <div className="gov-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">Demand Heatmaps</h3>
          <p className="gov-text-muted text-sm">Corredores con mayor y menor demanda</p>
        </div>
        <Map size={20} className="gov-text-accent" />
      </div>
      <div className="analytics-map analytics-map-live">
        {showMap ? (
          <GoogleHeatmap apiKey={apiKey} points={points} center={center} />
        ) : (
          <div className="analytics-map-fallback">
            {apiKey ? "Sin datos de paradas para el heatmap" : "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"}
          </div>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="gov-surface-muted rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Alta demanda</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {highlights.highDemand.length ? (
              highlights.highDemand.map((name) => (
                <span key={name} className="analytics-chip analytics-chip-hot">
                  {name}
                </span>
              ))
            ) : (
              <span className="gov-text-muted text-sm">Sin rutas criticas</span>
            )}
          </div>
        </div>
        <div className="gov-surface-muted rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] gov-text-muted">Baja demanda</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {highlights.lowDemand.length ? (
              highlights.lowDemand.map((name) => (
                <span key={name} className="analytics-chip analytics-chip-cool">
                  {name}
                </span>
              ))
            ) : (
              <span className="gov-text-muted text-sm">Sin rutas subutilizadas</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
