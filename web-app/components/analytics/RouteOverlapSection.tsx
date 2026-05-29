import { DataTable } from "@/components/DataTable";
import type { ReactNode } from "react";
import type { OverlapRow } from "@/components/analytics/types";

type RouteOverlapSectionProps = {
  rows: OverlapRow[];
  columns: Array<{ key: keyof OverlapRow; label: string; render?: (val: any) => ReactNode }>;
};

export function RouteOverlapSection({ rows, columns }: RouteOverlapSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold gov-text-tertiary">Route Overlap Analysis</h2>
      <p className="gov-text-muted">Rutas con paradas compartidas</p>
      {rows.length ? (
        <DataTable data={rows} columns={columns} />
      ) : (
        <div className="gov-card p-6 text-sm gov-text-muted">
          Sin datos suficientes de paradas para calcular overlaps.
        </div>
      )}
    </section>
  );
}
