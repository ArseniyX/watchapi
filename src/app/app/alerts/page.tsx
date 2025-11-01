"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { trpc } from "@/lib/trpc";
import { AlertStatistics } from "./alert-statistics";
import { AlertHistory } from "./alert-history";
import type { AlertHistoryItem } from "./alert-history";
import { NotificationChannels } from "./notification-channels";

export default function AlertsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const { data: organizations } =
    trpc.organization.getMyOrganizations.useQuery();

  const { data: endpoints } = trpc.apiEndpoint.getMyEndpoints.useQuery(
    undefined,
    {
      refetchOnWindowFocus: true,
      refetchInterval: 60000,
    },
  );

  const { data: recentFailures } = trpc.monitoring.getRecentFailures.useQuery(
    { organizationId: selectedOrgId as string, limit: 50 },
    { enabled: !!selectedOrgId, refetchInterval: 60000 },
  );

  useEffect(() => {
    if (!selectedOrgId && organizations?.length) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  const failedChecks = useMemo<AlertHistoryItem[]>(
    () =>
      recentFailures?.map((check) => ({
        id: check.id,
        status: check.status,
        statusCode: check.statusCode,
        errorMessage: check.errorMessage,
        responseTime: check.responseTime,
        checkedAt: check.checkedAt,
        endpointName: check.apiEndpoint.name,
        endpointUrl: check.apiEndpoint.url,
      })) ?? [],
    [recentFailures],
  );

  const statistics = useMemo(() => {
    const totalEndpoints = endpoints?.length ?? 0;
    const activeMonitoring =
      endpoints?.filter((endpoint) => endpoint.isActive).length ?? 0;

    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const weekInMs = 7 * dayInMs;

    const counters = failedChecks.reduce(
      (acc, check) => {
        const diff = now - new Date(check.checkedAt).getTime();
        if (diff < dayInMs) acc.failedToday += 1;
        if (diff < weekInMs) acc.failedThisWeek += 1;
        return acc;
      },
      { failedToday: 0, failedThisWeek: 0 },
    );

    return {
      totalEndpoints,
      activeMonitoring,
      failedToday: counters.failedToday,
      failedThisWeek: counters.failedThisWeek,
    };
  }, [endpoints, failedChecks]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader
        title="Alerts"
        description="Failed endpoint checks and alerts"
      />

      <AlertStatistics
        totalEndpoints={statistics.totalEndpoints}
        activeMonitoring={statistics.activeMonitoring}
        failedToday={statistics.failedToday}
        failedThisWeek={statistics.failedThisWeek}
      />

      <AlertHistory failedChecks={failedChecks} />

      <NotificationChannels selectedOrgId={selectedOrgId} />
    </div>
  );
}
