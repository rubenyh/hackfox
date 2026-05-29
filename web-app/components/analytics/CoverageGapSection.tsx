import { DataTable } from "@/components/DataTable";
import type { ReactNode } from "react";
import type { CoverageRow } from "@/components/analytics/types";

type CoverageGapSectionProps = {
  rows: CoverageRow[];
  columns: Array<{ key: keyof CoverageRow; label: string; render?: (val: any) => ReactNode }>;
};

export function CoverageGapSection({ rows, columns }: CoverageGapSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold gov-text-tertiary">Coverage Gap Detection</h2>
      <p className="gov-text-muted">Areas con alta demanda y baja cobertura</p>
      <DataTable data={rows} columns={columns} />
    </section>
  );
}
