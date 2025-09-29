import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Settings, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const monitoringData = [
  {
    id: 1,
    endpoint: "/api/users",
    method: "GET",
    status: "success",
    responseTime: "120ms",
    lastCheck: "30 seconds ago",
    uptime: "99.9%",
    location: "US East",
  },
  {
    id: 2,
    endpoint: "/api/orders",
    method: "POST",
    status: "success",
    responseTime: "89ms",
    lastCheck: "1 minute ago",
    uptime: "100%",
    location: "US West",
  },
  {
    id: 3,
    endpoint: "/api/products",
    method: "GET",
    status: "slow",
    responseTime: "1.2s",
    lastCheck: "2 minutes ago",
    uptime: "98.5%",
    location: "EU Central",
  },
  {
    id: 4,
    endpoint: "/api/auth",
    method: "POST",
    status: "success",
    responseTime: "45ms",
    lastCheck: "45 seconds ago",
    uptime: "99.8%",
    location: "Asia Pacific",
  },
  {
    id: 5,
    endpoint: "/api/payments",
    method: "POST",
    status: "error",
    responseTime: "timeout",
    lastCheck: "5 minutes ago",
    uptime: "95.2%",
    location: "US East",
  },
]

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "slow":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    success: "default",
    slow: "secondary",
    error: "destructive",
  } as const

  return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
}

export default function MonitoringPage() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitoringData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <StatusIcon status={item.status} />
                      <StatusBadge status={item.status} />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{item.endpoint}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{item.responseTime}</TableCell>
                  <TableCell>{item.uptime}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="text-muted-foreground">{item.lastCheck}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
