"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, AlertTriangle, Clock, TrendingUp } from "lucide-react";

export type DashboardStats = {
  uptime: string;
  avgResponseTime: string;
  errorRate: string;
  totalEndpoints: string;
} | null;

const statItems = [
  {
    key: "uptime" as const,
    label: "API Uptime",
    helper: "Last 30 days",
    Icon: Activity,
    fallback: "0%",
  },
  {
    key: "avgResponseTime" as const,
    label: "Avg Latency",
    helper: "Response time",
    Icon: Clock,
    fallback: "0ms",
  },
  {
    key: "errorRate" as const,
    label: "Error Rate",
    helper: "Failed requests",
    Icon: AlertTriangle,
    fallback: "0%",
  },
  {
    key: "totalEndpoints" as const,
    label: "Endpoints",
    helper: "Total monitored",
    Icon: TrendingUp,
    fallback: "0",
  },
];

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map(({ key, label, helper, Icon, fallback }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.[key] ?? fallback}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{helper}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
