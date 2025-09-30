"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Settings, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { trpc } from "@/lib/trpc"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

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

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "TIMEOUT":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "ERROR":
    case "FAILURE":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    SUCCESS: "default",
    TIMEOUT: "secondary",
    ERROR: "destructive",
    FAILURE: "destructive",
  } as const

  const displayText = {
    SUCCESS: "success",
    TIMEOUT: "timeout",
    ERROR: "error",
    FAILURE: "failed",
  } as const

  return (
    <Badge variant={variants[status as keyof typeof variants] || "default"}>
      {displayText[status as keyof typeof displayText] || status.toLowerCase()}
    </Badge>
  )
}

export default function MonitoringPage() {
  const router = useRouter()
  const { data: endpoints, isLoading } = trpc.monitoring.getMyEndpoints.useQuery()

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
            <p className="text-muted-foreground">Real-time API health and performance monitoring</p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configure Monitoring
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search endpoints..." className="pl-8" />
          </div>
          <Select defaultValue="1min">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Monitoring interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30s">Every 30 seconds</SelectItem>
              <SelectItem value="1min">Every minute</SelectItem>
              <SelectItem value="5min">Every 5 minutes</SelectItem>
              <SelectItem value="15min">Every 15 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Health Status</CardTitle>
            <CardDescription>Current status of all monitored endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
          <p className="text-muted-foreground">Real-time API health and performance monitoring</p>
        </div>
        <Button onClick={() => router.push('/app/collections')}>
          <Settings className="mr-2 h-4 w-4" />
          Configure Monitoring
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search endpoints..." className="pl-8" />
        </div>
        <Select defaultValue="1min">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Monitoring interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30s">Every 30 seconds</SelectItem>
            <SelectItem value="1min">Every minute</SelectItem>
            <SelectItem value="5min">Every 5 minutes</SelectItem>
            <SelectItem value="15min">Every 15 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Health Status</CardTitle>
          <CardDescription>Current status of all monitored endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {!endpoints || endpoints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No API endpoints configured yet</p>
              <Button onClick={() => router.push('/app/collections')}>
                <Settings className="mr-2 h-4 w-4" />
                Add Your First Endpoint
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpoints.map((endpoint) => (
                  <EndpointRow key={endpoint.id} endpoint={endpoint} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EndpointRow({ endpoint }: { endpoint: any }) {
  const { data: history } = trpc.monitoring.getHistory.useQuery(
    { endpointId: endpoint.id, take: 1 },
    { refetchInterval: 30000 }
  )
  const { data: uptimeStats } = trpc.monitoring.getUptimeStats.useQuery(
    { endpointId: endpoint.id, days: 30 }
  )

  const lastCheck = history?.[0]
  const uptime = uptimeStats ? `${uptimeStats.uptimePercentage.toFixed(1)}%` : 'N/A'

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          <StatusIcon status={lastCheck?.status || 'unknown'} />
          <StatusBadge status={lastCheck?.status || 'unknown'} />
        </div>
      </TableCell>
      <TableCell className="font-mono">{endpoint.name || endpoint.url}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono text-xs">
          {endpoint.method}
        </Badge>
      </TableCell>
      <TableCell className="font-mono">
        {lastCheck?.responseTime ? formatDuration(lastCheck.responseTime) : 'N/A'}
      </TableCell>
      <TableCell>{uptime}</TableCell>
      <TableCell>
        <Badge variant={endpoint.isActive ? "default" : "secondary"}>
          {endpoint.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {lastCheck ? formatTime(new Date(lastCheck.checkedAt)) : 'Never'}
      </TableCell>
    </TableRow>
  )
}
