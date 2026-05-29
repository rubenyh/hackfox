import { DataTable } from "@/components/DataTable";
import { Layers } from "lucide-react";
import type { ReactNode } from "react";
import type { ForecastRow } from "@/components/analytics/types";

type DemandForecastingCardProps = {
  rows: ForecastRow[];
  columns: Array<{ key: keyof ForecastRow; label: string; render?: (val: any) => ReactNode }>;
};

export function DemandForecastingCard({ rows, columns }: DemandForecastingCardProps) {
  return (
    <div className="gov-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold gov-text-tertiary">Demand Forecasting</h3>
          <p className="gov-text-muted text-sm">Proyeccion semanal de demanda</p>
        </div>
        <Layers size={20} className="gov-text-accent" />
      </div>
      <DataTable data={rows} columns={columns} />
    </div>
  );
}
