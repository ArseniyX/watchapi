"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { chartTheme } from "@/lib/chart-theme";

const data = [
  { name: "00:00", value: 245 },
  { name: "02:00", value: 234 },
  { name: "04:00", value: 267 },
  { name: "06:00", value: 189 },
  { name: "08:00", value: 298 },
  { name: "10:00", value: 234 },
  { name: "12:00", value: 345 },
  { name: "14:00", value: 267 },
  { name: "16:00", value: 234 },
  { name: "18:00", value: 298 },
  { name: "20:00", value: 234 },
  { name: "22:00", value: 267 },
];

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
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
        <Area
          type="monotone"
          dataKey="value"
          strokeWidth={2}
          stroke="hsl(var(--chart-1))"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
