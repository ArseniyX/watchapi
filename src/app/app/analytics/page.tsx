"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
} from "lucide-react";
import { AnalyticsChart } from "@/components/analytics-chart";
import { UptimeChart } from "@/components/uptime-chart";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/dashboard-header";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);

  const { data: analytics } = trpc.monitoring.getAnalytics.useQuery({ days });
  const { data: topEndpoints } = trpc.monitoring.getTopEndpoints.useQuery({
    days,
    limit: 5,
  });
  const { data: responseTimeData } =
    trpc.monitoring.getResponseTimeChart.useQuery({ days });
  const { data: uptimeData } = trpc.monitoring.getUptimeChart.useQuery({
    days,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatChange = (change: number) => {
    const formatted = change.toFixed(1);
    return change > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const metrics = [
    {
      title: "Total Requests",
      value: formatNumber(analytics?.current.totalChecks || 0),
      change: formatChange(analytics?.changes.totalChecks || 0),
      trend: (analytics?.changes.totalChecks || 0) >= 0 ? "up" : "down",
      icon: Activity,
    },
    {
      title: "Avg Response Time",
      value: `${Math.round(analytics?.current.avgResponseTime || 0)}ms`,
      change: formatChange(analytics?.changes.avgResponseTime || 0),
      trend: (analytics?.changes.avgResponseTime || 0) <= 0 ? "up" : "down",
      icon: Clock,
    },
    {
      title: "Error Rate",
      value: `${(analytics?.current.errorRate || 0).toFixed(2)}%`,
      change: formatChange(analytics?.changes.errorRate || 0),
      trend: (analytics?.changes.errorRate || 0) <= 0 ? "up" : "down",
      icon: TrendingDown,
    },
    {
      title: "Uptime",
      value: `${(analytics?.current.uptimePercentage || 0).toFixed(2)}%`,
      change: formatChange(analytics?.changes.uptimePercentage || 0),
      trend: (analytics?.changes.uptimePercentage || 0) >= 0 ? "up" : "down",
      icon: TrendingUp,
    },
  ];
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <DashboardHeader
        title="Analytics"
        description="Detailed insights into your API performance"
        actions={
          <Select
            value={days.toString()}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span
                  className={`flex items-center ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {metric.change}
                </span>
                <span className="text-muted-foreground">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>Average response times over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={responseTimeData} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Uptime Overview</CardTitle>
            <CardDescription>API availability percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <UptimeChart data={uptimeData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>
            Most frequently accessed API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!topEndpoints || topEndpoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No endpoint data available yet. Start monitoring endpoints to see
              analytics.
            </div>
          ) : (
            <div className="space-y-4">
              {topEndpoints.map((endpoint, index) => (
                <div
                  key={endpoint.id}
                  className="flex flex-col gap-4 p-4 border rounded-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex w-full items-start gap-4 sm:w-auto sm:items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{endpoint.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {endpoint.url}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(endpoint.totalChecks)} checks
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-4 text-sm sm:w-auto sm:justify-end sm:space-x-6 sm:gap-0">
                    <div className="text-left sm:text-center">
                      <p className="font-medium">
                        {endpoint.avgResponseTime}ms
                      </p>
                      <p className="text-muted-foreground">Avg Time</p>
                    </div>
                    <div className="text-left sm:text-center">
                      <p className="font-medium">{endpoint.errorRate}%</p>
                      <p className="text-muted-foreground">Error Rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
