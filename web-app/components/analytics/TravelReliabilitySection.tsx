import { DataTable } from "@/components/DataTable";
import type { ReactNode } from "react";
import type { TravelRow } from "@/components/analytics/types";

type TravelReliabilitySectionProps = {
  rows: TravelRow[];
  columns: Array<{ key: keyof TravelRow; label: string; render?: (val: any) => ReactNode }>;
};

export function TravelReliabilitySection({ rows, columns }: TravelReliabilitySectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold gov-text-tertiary">Travel Time & Reliability</h2>
      <p className="gov-text-muted">Comparativo programado vs real</p>
      <DataTable data={rows} columns={columns} />
    </section>
  );
}
