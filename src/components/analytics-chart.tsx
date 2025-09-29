"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Mon", value: 245 },
  { name: "Tue", value: 234 },
  { name: "Wed", value: 267 },
  { name: "Thu", value: 189 },
  { name: "Fri", value: 298 },
  { name: "Sat", value: 234 },
  { name: "Sun", value: 267 },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
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
  )
}
