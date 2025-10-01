"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface UptimeChartProps {
  data?: Array<{
    status?: string
    checkedAt?: Date | string
  }>
}

export function UptimeChart({ data }: UptimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available yet
      </div>
    )
  }

  // Group data by day and calculate uptime percentage
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item.checkedAt)
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const key = day.getTime()

    if (!acc[key]) {
      acc[key] = { time: day, total: 0, successful: 0 }
    }
    acc[key].total++
    if (item.status === 'SUCCESS') {
      acc[key].successful++
    }
    return acc
  }, {} as Record<number, { time: Date; total: number; successful: number }>)

  const chartData = Object.values(groupedData).map(group => ({
    name: group.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    uptime: group.total > 0 ? parseFloat(((group.successful / group.total) * 100).toFixed(2)) : 0,
  })).sort((a, b) => {
    const dateA = new Date(a.name)
    const dateB = new Date(b.name)
    return dateA.getTime() - dateB.getTime()
  })

  const minUptime = Math.min(...chartData.map(d => d.uptime))
  const domain = [Math.max(0, minUptime - 5), 100]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={domain}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value) => [`${value}%`, "Uptime"]}
        />
        <Bar dataKey="uptime" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
