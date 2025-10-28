"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartTheme, chartTooltipStyles } from "@/lib/chart-theme";

interface AnalyticsChartProps {
  data?: Array<{
    responseTime?: number | null;
    checkedAt?: Date | string;
  }>;
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available yet
      </div>
    );
  }

  // Group data by hour and calculate average
  const groupedData = data.reduce(
    (acc, item) => {
      const date = new Date(item.checkedAt);
      const hour = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
      );
      const key = hour.getTime();

      if (!acc[key]) {
        acc[key] = { time: hour, values: [] };
      }
      if (item.responseTime) {
        acc[key].values.push(item.responseTime);
      }
      return acc;
    },
    {} as Record<number, { time: Date; values: number[] }>,
  );

  const chartData = Object.values(groupedData)
    .map((group) => ({
      name: group.time.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      }),
      value: Math.round(
        group.values.reduce((sum, v) => sum + v, 0) / group.values.length,
      ),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid
          stroke={chartTheme.gridColor}
          strokeDasharray="4 4"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke={chartTheme.axisColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: chartTheme.axisColor }}
        />
        <YAxis
          stroke={chartTheme.axisColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: chartTheme.axisColor }}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip
          contentStyle={chartTooltipStyles.content}
          labelStyle={chartTooltipStyles.label}
        />
        <Line
          type="monotone"
          dataKey="value"
          strokeWidth={2}
          stroke="hsl(var(--chart-1))"
          dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
