import { Sparkles } from "lucide-react";

type AnalyticsHeroProps = {
  actionsCount: number;
  isSimulated?: boolean;
};

export function AnalyticsHero({ actionsCount, isSimulated = false }: AnalyticsHeroProps) {
  return (
    <section className="analytics-hero gov-card p-8 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">
            Route Optimization & Analytics
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            Optimizacion de red, capacidad y servicio
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl">
            Tablero estrategico para detectar rutas criticas, brechas de cobertura
            y recomendaciones accionables en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            {/* <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                isSimulated ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}
            >
              {isSimulated ? "Datos simulados" : "Datos reales"}
            </span> */}
          </div>
          <button
            type="button"
            className="rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-white"
          >
            Optimizar red
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm text-white/80">
            <Sparkles size={16} />
            {actionsCount} acciones sugeridas
          </div>
        </div>
      </div>
    </section>
  );
}
