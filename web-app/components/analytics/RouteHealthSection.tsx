import { DataTable } from "@/components/DataTable";
import { Network } from "lucide-react";
import type { ReactNode } from "react";
import type { RouteHealthRow } from "@/components/analytics/types";

type RouteHealthSectionProps = {
  routes: RouteHealthRow[];
  columns: Array<{ key: keyof RouteHealthRow; label: string; render?: (val: any) => ReactNode }>;
};

export function RouteHealthSection({ routes, columns }: RouteHealthSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold gov-text-tertiary">Route Health Analysis</h2>
          <p className="gov-text-muted">Clasificacion de rendimiento y confiabilidad</p>
        </div>
        <div className="flex items-center gap-2 text-sm gov-text-muted">
          <Network size={16} />
          {routes.length} rutas analizadas
        </div>
      </div>
      <DataTable data={routes} columns={columns} />
    </section>
  );
}
