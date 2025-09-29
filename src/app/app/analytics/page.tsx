import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react"
import { AnalyticsChart } from "@/components/analytics-chart"
import { UptimeChart } from "@/components/uptime-chart"

const metrics = [
  {
    title: "Total Requests",
    value: "2.4M",
    change: "+12.5%",
    trend: "up",
    icon: Activity,
  },
  {
    title: "Avg Response Time",
    value: "234ms",
    change: "-8.2%",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Error Rate",
    value: "0.12%",
    change: "+0.02%",
    trend: "down",
    icon: TrendingDown,
  },
  {
    title: "Uptime",
    value: "99.94%",
    change: "+0.1%",
    trend: "up",
    icon: TrendingUp,
  },
]

const topEndpoints = [
  { endpoint: "/api/users", requests: "456K", avgTime: "120ms", errors: "0.01%" },
  { endpoint: "/api/products", requests: "324K", avgTime: "89ms", errors: "0.05%" },
  { endpoint: "/api/orders", requests: "234K", avgTime: "156ms", errors: "0.02%" },
  { endpoint: "/api/auth", requests: "189K", avgTime: "45ms", errors: "0.00%" },
  { endpoint: "/api/payments", requests: "98K", avgTime: "234ms", errors: "0.08%" },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your API performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className={`flex items-center ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
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
            <AnalyticsChart />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Uptime Overview</CardTitle>
            <CardDescription>API availability percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <UptimeChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>Most frequently accessed API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEndpoints.map((endpoint, index) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-mono font-medium">{endpoint.endpoint}</p>
                    <p className="text-sm text-muted-foreground">{endpoint.requests} requests</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{endpoint.avgTime}</p>
                    <p className="text-muted-foreground">Avg Time</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{endpoint.errors}</p>
                    <p className="text-muted-foreground">Error Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
