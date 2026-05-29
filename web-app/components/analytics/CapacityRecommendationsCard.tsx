import { ArrowUpRight } from "lucide-react";
import type { RecommendationItem } from "@/components/analytics/types";

type CapacityRecommendationsCardProps = {
  recommendations: RecommendationItem[];
};

export function CapacityRecommendationsCard({ recommendations }: CapacityRecommendationsCardProps) {
  return (
    <div className="gov-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">Capacity Recommendations</h3>
          <p className="gov-text-muted text-sm">Rutas con sobrecupo o saturacion</p>
        </div>
        <ArrowUpRight size={20} className="gov-text-accent" />
      </div>
      <div className="space-y-3">
        {recommendations.length ? (
          recommendations.map((rec) => (
            <div key={rec.routeName} className="analytics-reco">
              <div>
                <p className="text-sm font-semibold gov-text-tertiary">{rec.routeName}</p>
                <p className="text-xs gov-text-muted">{rec.detail}</p>
              </div>
              <span className="text-xs font-semibold gov-text-success">
                {rec.recommendation}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm gov-text-muted">Sin rutas sobrecargadas en este momento.</p>
        )}
      </div>
    </div>
  );
}
