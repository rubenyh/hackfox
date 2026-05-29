import { Map } from "lucide-react";
import type { DemandHighlights } from "@/components/analytics/types";

type DemandHeatmapsCardProps = {
  highlights: DemandHighlights;
};

export function DemandHeatmapsCard({ highlights }: DemandHeatmapsCardProps) {
  return (
    <div className="gov-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">Demand Heatmaps</h3>
          <p className="gov-text-muted text-sm">Corredores con mayor y menor demanda</p>
        </div>
        <Map size={20} className="gov-text-accent" />
      </div>
      <div className="analytics-map">
        <div className="analytics-map-pulse" />
        <div className="analytics-map-grid" />
        <div className="analytics-map-label">Centro Urbano</div>
        <div className="analytics-map-label analytics-map-label-low">Zona Residencial</div>
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
