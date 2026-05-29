import { ArrowUpRight, Sparkles } from "lucide-react";

type AITransitPlannerCardProps = {
  actions: string[];
};

export function AITransitPlannerCard({ actions }: AITransitPlannerCardProps) {
  return (
    <div id="ai-transit-planner" className="gov-card p-6 space-y-4 scroll-mt-28">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">AI Transit Planner</h3>
          <p className="gov-text-muted text-sm">Acciones sugeridas al optimizar red</p>
        </div>
        <Sparkles size={20} className="gov-text-accent" />
      </div>
      <div className="space-y-3">
        {actions.length ? (
          actions.map((action) => (
            <div key={action} className="analytics-action">
              <span className="analytics-action-icon">
                <ArrowUpRight size={14} />
              </span>
              <span className="text-sm gov-text-tertiary">{action}</span>
            </div>
          ))
        ) : (
          <p className="text-sm gov-text-muted">Sin acciones urgentes hoy.</p>
        )}
      </div>
      <div className="rounded-2xl gov-surface-muted p-4 text-xs gov-text-muted">
        Proyeccion: +15% capacidad, -10% espera, -8% costos operativos.
      </div>
    </div>
  );
}
