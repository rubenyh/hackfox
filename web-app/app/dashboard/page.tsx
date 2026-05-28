"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardOverview } from "@/components/DashboardOverview";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardOverview />
    </ProtectedRoute>
  );
}
