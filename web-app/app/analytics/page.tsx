"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  AITransitPlannerCard,
  AnalyticsHero,
  CapacityRecommendationsCard,
  CoverageGapSection,
  DemandForecastingCard,
  DemandHeatmapsCard,
  ExecutiveSummarySection,
  FleetOptimizationCard,
  PeakHourAnalysisCard,
  RouteHealthSection,
  RouteOverlapSection,
  TopRoutesAttentionSection,
  TravelReliabilitySection,
} from "@/components/analytics";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

export default function AnalyticsPage() {
  const {
    buses,
    routeHealth,
    routeHealthColumns,
    executiveCards,
    demandHighlights,
    peakHourData,
    heatmapPoints,
    heatmapCenter,
    capacityRecommendations,
    fleetRecommendations,
    coverageRows,
    coverageColumns,
    overlapRows,
    overlapColumns,
    travelRows,
    travelColumns,
    forecastRows,
    forecastColumns,
    aiActions,
    topRoutesAttention,
  } = useAnalyticsData();

  return (
    <ProtectedRoute>
      <div className="analytics-shell space-y-10">
        <AnalyticsHero actionsCount={aiActions.length} />
        <ExecutiveSummarySection cards={executiveCards} />
        <RouteHealthSection routes={routeHealth} columns={routeHealthColumns} />

        <section className="grid gap-6 lg:grid-cols-2">
          <DemandHeatmapsCard
            highlights={demandHighlights}
            points={heatmapPoints}
            center={heatmapCenter}
          />
          <PeakHourAnalysisCard data={peakHourData} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <CapacityRecommendationsCard recommendations={capacityRecommendations} />
          <FleetOptimizationCard recommendations={fleetRecommendations} busCount={buses.length} />
        </section>

        <CoverageGapSection rows={coverageRows} columns={coverageColumns} />
        <RouteOverlapSection rows={overlapRows} columns={overlapColumns} />
        <TravelReliabilitySection rows={travelRows} columns={travelColumns} />

        <section className="grid gap-6 lg:grid-cols-2">
          <DemandForecastingCard rows={forecastRows} columns={forecastColumns} />
          <AITransitPlannerCard actions={aiActions} />
        </section>

        <TopRoutesAttentionSection routes={topRoutesAttention} columns={routeHealthColumns} />
      </div>
    </ProtectedRoute>
  );
}
