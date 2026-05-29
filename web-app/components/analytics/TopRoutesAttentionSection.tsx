import { DataTable } from "@/components/DataTable";
import type { ReactNode } from "react";
import type { RouteHealthRow } from "@/components/analytics/types";

type TopRoutesAttentionSectionProps = {
  routes: RouteHealthRow[];
  columns: Array<{ key: keyof RouteHealthRow; label: string; render?: (val: any) => ReactNode }>;
};

export function TopRoutesAttentionSection({ routes, columns }: TopRoutesAttentionSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold gov-text-tertiary">Top Routes Requiring Attention</h2>
      <DataTable data={routes} columns={columns} />
    </section>
  );
}
