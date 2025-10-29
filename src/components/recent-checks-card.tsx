"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AppRouter } from "@/server/app";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type EndpointList = RouterOutputs["apiEndpoint"]["getMyEndpoints"];
type HistoryList = RouterOutputs["monitoring"]["getHistory"];

type RecentChecksCardProps = {
  endpoints?: EndpointList;
  history?: HistoryList;
  isLoading: boolean;
};

const statusDisplay = {
  SUCCESS: {
    colorClass: "bg-green-500",
    badgeVariant: "default",
    label: "success",
  },
  TIMEOUT: {
    colorClass: "bg-yellow-500",
    badgeVariant: "secondary",
    label: "timeout",
  },
  ERROR: {
    colorClass: "bg-red-500",
    badgeVariant: "destructive",
    label: "error",
  },
  FAILURE: {
    colorClass: "bg-red-500",
    badgeVariant: "destructive",
    label: "error",
  },
} as const;

const fallbackStatus = {
  colorClass: "bg-gray-400",
  badgeVariant: "secondary",
  label: "unknown",
} as const;

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function formatTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function RecentChecksCard({
  endpoints,
  history,
  isLoading,
}: RecentChecksCardProps) {
  const getEndpointLabel = (endpointId: string) => {
    const endpoint = endpoints?.find((item) => item.id === endpointId);
    return endpoint?.name || endpoint?.url || "Unknown";
  };

  const rows = history?.slice(0, 5) ?? [];

  return (
    <Card className="col-span-4 w-full md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent API Checks</CardTitle>
        <CardDescription>Latest monitoring results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : rows.length > 0 ? (
            rows.map((check) => {
              const status =
                statusDisplay[check.status as keyof typeof statusDisplay] ??
                fallbackStatus;

              return (
                <div
                  key={check.id}
                  className="flex gap-3 sm:flex-row justify-between"
                >
                  <div className="flex w-full items-center gap-3 sm:w-auto">
                    <div
                      className={`h-2 w-2 rounded-full ${status.colorClass}`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {getEndpointLabel(check.apiEndpointId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(new Date(check.checkedAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:w-auto sm:flex-col sm:items-end">
                    <p className="text-sm font-medium sm:text-right">
                      {formatDuration(check.responseTime)}
                    </p>
                    <Badge
                      variant={
                        status.badgeVariant as
                          | "default"
                          | "secondary"
                          | "destructive"
                      }
                      className="w-fit text-xs sm:self-end"
                    >
                      {status.label}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p>No recent checks</p>
              <p className="mt-1 text-xs">
                Add some API endpoints to start monitoring
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
