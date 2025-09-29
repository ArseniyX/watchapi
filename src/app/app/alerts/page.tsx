import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Bell, Mail, MessageSquare } from "lucide-react"

const alerts = [
  {
    id: 1,
    name: "High Response Time",
    endpoint: "/api/users",
    condition: "Response time > 1000ms",
    channel: "email",
    status: "active",
    triggered: "Never",
  },
  {
    id: 2,
    name: "Payment API Down",
    endpoint: "/api/payments",
    condition: "Status code != 200",
    channel: "slack",
    status: "active",
    triggered: "2 days ago",
  },
  {
    id: 3,
    name: "Error Rate Spike",
    endpoint: "/api/orders",
    condition: "Error rate > 5%",
    channel: "email",
    status: "paused",
    triggered: "1 week ago",
  },
  {
    id: 4,
    name: "Low Uptime",
    endpoint: "/api/products",
    condition: "Uptime < 99%",
    channel: "discord",
    status: "active",
    triggered: "Never",
  },
]

const ChannelIcon = ({ channel }: { channel: string }) => {
  switch (channel) {
    case "email":
      return <Mail className="h-4 w-4" />
    case "slack":
      return <MessageSquare className="h-4 w-4" />
    case "discord":
      return <MessageSquare className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

export default function AlertsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">Configure notifications for API issues</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Alert
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Alert Rule</CardTitle>
            <CardDescription>Set up notifications for API monitoring events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alert-name">Alert Name</Label>
              <Input id="alert-name" placeholder="High response time alert" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/api/users">/api/users</SelectItem>
                  <SelectItem value="/api/orders">/api/orders</SelectItem>
                  <SelectItem value="/api/products">/api/products</SelectItem>
                  <SelectItem value="/api/payments">/api/payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="response-time">Response time greater than</SelectItem>
                  <SelectItem value="status-code">Status code not equal to</SelectItem>
                  <SelectItem value="error-rate">Error rate greater than</SelectItem>
                  <SelectItem value="uptime">Uptime less than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input id="threshold" placeholder="1000ms, 200, 5%, 99%" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Notification Channel</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Create Alert</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Statistics</CardTitle>
            <CardDescription>Overview of your alert activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Alerts</span>
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Triggered Today</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-2xl font-bold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-2xl font-bold">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>Manage your configured alert rules</CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alerts..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.name}</TableCell>
                  <TableCell className="font-mono">{alert.endpoint}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{alert.condition}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <ChannelIcon channel={alert.channel} />
                      <span className="capitalize">{alert.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={alert.status === "active" ? "default" : "secondary"}>{alert.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{alert.triggered}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
