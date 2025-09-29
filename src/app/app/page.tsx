"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { trpc } from "@/lib/trpc"
import { Skeleton } from "@/components/ui/skeleton"

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function formatTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function DashboardPage() {
  const { data: endpoints, isLoading: endpointsLoading } = trpc.monitoring.getMyEndpoints.useQuery()
  const { data: history, isLoading: historyLoading } = trpc.monitoring.getHistory.useQuery(
    { endpointId: endpoints?.[0]?.id || '', take: 5 },
    { enabled: !!endpoints?.[0]?.id }
  )

  // Calculate dashboard stats from real data
  const calculateStats = () => {
    if (!endpoints || !history) return null

    const totalEndpoints = endpoints.length
    const activeEndpoints = endpoints.filter(e => e.isActive).length

    // Calculate uptime based on recent checks
    const successfulChecks = history.filter(h => h.status === 'SUCCESS').length
    const totalChecks = history.length
    const uptime = totalChecks > 0 ? ((successfulChecks / totalChecks) * 100).toFixed(1) : '0.0'

    // Calculate average response time
    const responseTimes = history.filter(h => h.responseTime).map(h => h.responseTime!)
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

    // Calculate error rate
    const errorChecks = history.filter(h => h.status === 'ERROR' || h.status === 'FAILURE').length
    const errorRate = totalChecks > 0 ? ((errorChecks / totalChecks) * 100).toFixed(2) : '0.00'

    return {
      uptime: `${uptime}%`,
      avgResponseTime: `${avgResponseTime}ms`,
      errorRate: `${errorRate}%`,
      totalEndpoints: totalEndpoints.toString(),
    }
  }

  const stats = calculateStats()

  if (endpointsLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your API performance at a glance</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your API performance at a glance</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uptime || '0%'}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgResponseTime || '0ms'}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Response time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.errorRate || '0%'}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Failed requests</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEndpoints || '0'}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Total monitored</span>
            </div>
          </CardContent>
        </Card>
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
              {historyLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))
              ) : history && history.length > 0 ? (
                history.slice(0, 5).map((check) => {
                  const endpoint = endpoints?.find(e => e.id === check.apiEndpointId)
                  const statusColor =
                    check.status === 'SUCCESS' ? 'bg-green-500' :
                    check.status === 'TIMEOUT' ? 'bg-yellow-500' : 'bg-red-500'
                  const statusText =
                    check.status === 'SUCCESS' ? 'success' :
                    check.status === 'TIMEOUT' ? 'timeout' : 'error'
                  const statusVariant =
                    check.status === 'SUCCESS' ? 'default' :
                    check.status === 'TIMEOUT' ? 'secondary' : 'destructive'

                  return (
                    <div key={check.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                        <div>
                          <p className="text-sm font-medium">{endpoint?.name || endpoint?.url || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(new Date(check.checkedAt))}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {check.responseTime ? formatDuration(check.responseTime) : 'N/A'}
                        </p>
                        <Badge variant={statusVariant as any} className="text-xs">
                          {statusText}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>No recent checks</p>
                  <p className="text-xs mt-1">Add some API endpoints to start monitoring</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
