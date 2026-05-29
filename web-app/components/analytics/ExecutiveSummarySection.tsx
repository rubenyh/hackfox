import { KPICard } from "@/components/KPICard";
import type { ExecutiveCard } from "@/components/analytics/types";

type ExecutiveSummarySectionProps = {
  cards: ExecutiveCard[];
};

export function ExecutiveSummarySection({ cards }: ExecutiveSummarySectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold gov-text-tertiary">Executive Summary</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <KPICard key={card.label} label={card.label} value={card.value} icon={card.icon} />
        ))}
      </div>
    </section>
  );
}
