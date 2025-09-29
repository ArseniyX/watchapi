import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"

const stats = [
  {
    title: "API Uptime",
    value: "99.9%",
    description: "Last 30 days",
    icon: Activity,
    trend: "+0.1%",
    trendUp: true,
  },
  {
    title: "Avg Latency",
    value: "245ms",
    description: "Response time",
    icon: Clock,
    trend: "-12ms",
    trendUp: true,
  },
  {
    title: "Error Rate",
    value: "0.02%",
    description: "Failed requests",
    icon: AlertTriangle,
    trend: "-0.01%",
    trendUp: true,
  },
  {
    title: "Requests",
    value: "1.2M",
    description: "This month",
    icon: TrendingUp,
    trend: "+15%",
    trendUp: true,
  },
]

const recentChecks = [
  { endpoint: "/api/users", status: "success", latency: "120ms", time: "2 min ago" },
  { endpoint: "/api/orders", status: "success", latency: "89ms", time: "3 min ago" },
  { endpoint: "/api/products", status: "slow", latency: "1.2s", time: "5 min ago" },
  { endpoint: "/api/auth", status: "success", latency: "45ms", time: "7 min ago" },
  { endpoint: "/api/payments", status: "success", latency: "234ms", time: "10 min ago" },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your API performance at a glance</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <Badge variant={stat.trendUp ? "default" : "destructive"} className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>Average response times over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent API Checks</CardTitle>
            <CardDescription>Latest monitoring results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        check.status === "success"
                          ? "bg-green-500"
                          : check.status === "slow"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{check.endpoint}</p>
                      <p className="text-xs text-muted-foreground">{check.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{check.latency}</p>
                    <Badge
                      variant={
                        check.status === "success" ? "default" : check.status === "slow" ? "secondary" : "destructive"
                      }
                      className="text-xs"
                    >
                      {check.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
