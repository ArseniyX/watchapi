"use client";

import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardLoadingState } from "@/components/dashboard-loading-state";
import {
  DashboardStatsGrid,
  type DashboardStats,
} from "@/components/dashboard-stats-grid";
import { ResponseTimeCard } from "@/components/response-time-card";
import { RecentChecksCard } from "@/components/recent-checks-card";

export default function DashboardPage() {
  const { data: endpoints, isLoading: endpointsLoading } =
    trpc.apiEndpoint.getMyEndpoints.useQuery();
  const { data: history, isLoading: historyLoading } =
    trpc.monitoring.getHistory.useQuery(
      { endpointId: endpoints?.[0]?.id || "", take: 5 },
      { enabled: !!endpoints?.[0]?.id },
    );

  const calculateStats = (): DashboardStats => {
    if (!endpoints || !history) return null;

    const totalEndpoints = endpoints.length;

    const successfulChecks = history.filter(
      (h) => h.status === "SUCCESS",
    ).length;
    const totalChecks = history.length;
    const uptime =
      totalChecks > 0
        ? ((successfulChecks / totalChecks) * 100).toFixed(1)
        : "0.0";

    const responseTimes = history
      .filter((h) => h.responseTime)
      .map((h) => h.responseTime!);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          )
        : 0;

    const errorChecks = history.filter(
      (h) => h.status === "ERROR" || h.status === "FAILURE",
    ).length;
    const errorRate =
      totalChecks > 0 ? ((errorChecks / totalChecks) * 100).toFixed(2) : "0.00";

    return {
      uptime: `${uptime}%`,
      avgResponseTime: `${avgResponseTime}ms`,
      errorRate: `${errorRate}%`,
      totalEndpoints: totalEndpoints.toString(),
    };
  };

  const stats = calculateStats();

  if (endpointsLoading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader />
      <OnboardingChecklist />
      <DashboardStatsGrid stats={stats} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ResponseTimeCard />
        <RecentChecksCard
          endpoints={endpoints}
          history={history}
          isLoading={historyLoading}
        />
      </div>
    </div>
  );
}
