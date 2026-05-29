import { Bus } from "lucide-react";
import type { RecommendationItem } from "@/components/analytics/types";

type FleetOptimizationCardProps = {
  recommendations: RecommendationItem[];
  busCount: number;
};

export function FleetOptimizationCard({ recommendations, busCount }: FleetOptimizationCardProps) {
  return (
    <div className="gov-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">Fleet Optimization</h3>
          <p className="gov-text-muted text-sm">Detecta buses subutilizados</p>
        </div>
        <Bus size={20} className="gov-text-accent" />
      </div>
      <div className="space-y-3">
        {recommendations.length ? (
          recommendations.map((rec) => (
            <div key={rec.routeName} className="analytics-reco">
              <div>
                <p className="text-sm font-semibold gov-text-tertiary">{rec.routeName}</p>
                <p className="text-xs gov-text-muted">{rec.detail}</p>
              </div>
              <span className="text-xs font-semibold gov-text-primary">
                {rec.recommendation}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm gov-text-muted">No hay rutas subutilizadas hoy.</p>
        )}
      </div>
      <div className="rounded-2xl gov-surface-muted p-4 text-xs gov-text-muted">
        {busCount ? `${busCount} buses activos en la flota.` : "Sin telemetria de buses en linea."}
      </div>
    </div>
  );
}
