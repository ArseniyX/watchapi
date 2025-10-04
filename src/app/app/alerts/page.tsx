"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/code-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Mail,
  Webhook,
  MessageSquare,
  Trash2,
  Edit,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { NotificationType } from "@/generated/prisma";
import { toast } from "sonner";

function formatTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "TIMEOUT":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "ERROR":
    case "FAILURE":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationChannelIcon = ({ type }: { type: string }) => {
  switch (type) {
    case NotificationType.EMAIL:
      return <Mail className="h-4 w-4" />;
    case NotificationType.WEBHOOK:
      return <Webhook className="h-4 w-4" />;
    case NotificationType.SLACK:
    case NotificationType.DISCORD:
      return <MessageSquare className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function AlertsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<NotificationType>(
    NotificationType.EMAIL,
  );
  const [channelConfig, setChannelConfig] = useState("");

  const { data: organizations } =
    trpc.organization.getMyOrganizations.useQuery();
  const { data: endpoints } = trpc.apiEndpoint.getMyEndpoints.useQuery(
    undefined,
    {
      refetchOnWindowFocus: true,
      refetchInterval: 60000,
    },
  );

  const { data: channels, refetch: refetchChannels } =
    trpc.notificationChannel.getAll.useQuery(
      { organizationId: selectedOrgId! },
      { enabled: !!selectedOrgId },
    );

  const { data: recentFailures } = trpc.monitoring.getRecentFailures.useQuery(
    { organizationId: selectedOrgId!, limit: 50 },
    { enabled: !!selectedOrgId, refetchInterval: 60000 },
  );

  const createChannelMutation = trpc.notificationChannel.create.useMutation({
    onSuccess: () => {
      toast.success("Notification channel created successfully");
      refetchChannels();
      setChannelDialogOpen(false);
      resetChannelForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteChannelMutation = trpc.notificationChannel.delete.useMutation({
    onSuccess: () => {
      toast.success("Notification channel deleted");
      refetchChannels();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Set initial org if available
  if (!selectedOrgId && organizations && organizations.length > 0) {
    setSelectedOrgId(organizations[0].id);
  }

  const resetChannelForm = () => {
    setChannelName("");
    setChannelType(NotificationType.EMAIL);
    setChannelConfig("");
  };

  const getConfigPlaceholder = () => {
    switch (channelType) {
      case NotificationType.EMAIL:
        return '{"emails": ["ops@example.com", "team@example.com"]}';
      case NotificationType.WEBHOOK:
        return '{"url": "https://your-webhook.com/alerts", "headers": {"Authorization": "Bearer token"}}';
      case NotificationType.SLACK:
        return '{"webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"}';
      case NotificationType.DISCORD:
        return '{"webhookUrl": "https://discord.com/api/webhooks/YOUR/WEBHOOK"}';
      default:
        return "{}";
    }
  };

  const handleCreateChannel = () => {
    if (!selectedOrgId) return;

    try {
      JSON.parse(channelConfig);
    } catch {
      toast.error("Invalid JSON configuration");
      return;
    }

    createChannelMutation.mutate({
      organizationId: selectedOrgId,
      name: channelName,
      type: channelType,
      config: channelConfig,
    });
  };

  const handleDeleteChannel = (id: string) => {
    if (!selectedOrgId) return;
    if (!confirm("Are you sure you want to delete this notification channel?"))
      return;

    deleteChannelMutation.mutate({
      id,
      organizationId: selectedOrgId,
    });
  };

  // Use the dedicated failed checks query or fall back to endpoint checks
  const failedChecks =
    recentFailures?.map((check) => ({
      id: check.id,
      status: check.status,
      statusCode: check.statusCode,
      errorMessage: check.errorMessage,
      responseTime: check.responseTime,
      checkedAt: check.checkedAt,
      endpointName: check.apiEndpoint.name,
      endpointUrl: check.apiEndpoint.url,
    })) || [];

  // Calculate stats
  const totalEndpoints = endpoints?.length || 0;
  const activeAlerts = endpoints?.filter((e) => e.isActive).length || 0;
  const todayFailed = failedChecks.filter((c) => {
    const diff = Date.now() - new Date(c.checkedAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  }).length;
  const weekFailed = failedChecks.filter((c) => {
    const diff = Date.now() - new Date(c.checkedAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            Failed endpoint checks and alerts
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEndpoints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{todayFailed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {weekFailed}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Recent failed checks across all endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {failedChecks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-muted-foreground mb-2">No alerts</p>
              <p className="text-sm text-muted-foreground">
                All endpoints are healthy!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="min-w-[200px]">Endpoint</TableHead>
                    <TableHead className="min-w-[200px]">Error</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Status Code
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Response Time
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedChecks.slice(0, 50).map((check, index) => (
                    <TableRow key={`${check.id}-${index}`}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <StatusIcon status={check.status} />
                          <Badge
                            variant={
                              check.status === "TIMEOUT"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {check.status.toLowerCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium truncate">
                            {check.endpointName}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono truncate">
                            {check.endpointUrl}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                        <div className="truncate">
                          {check.errorMessage || "No error message"}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {check.statusCode ? (
                          <Badge variant="outline" className="font-mono">
                            {check.statusCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {check.responseTime ? `${check.responseTime}ms` : "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatTime(new Date(check.checkedAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how your team receives alerts when endpoints fail
              </CardDescription>
            </div>
            <Dialog
              open={channelDialogOpen}
              onOpenChange={setChannelDialogOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!selectedOrgId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Notification Channel</DialogTitle>
                  <DialogDescription>
                    Set up a new channel to receive alerts when API endpoints
                    fail
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel-name">Channel Name</Label>
                    <Input
                      id="channel-name"
                      placeholder="e.g., Team Email, Ops Webhook"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel-type">Channel Type</Label>
                    <Select
                      value={channelType}
                      onValueChange={(value) =>
                        setChannelType(value as NotificationType)
                      }
                    >
                      <SelectTrigger id="channel-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NotificationType.EMAIL}>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value={NotificationType.WEBHOOK}>
                          <div className="flex items-center">
                            <Webhook className="h-4 w-4 mr-2" />
                            Webhook
                          </div>
                        </SelectItem>
                        <SelectItem value={NotificationType.SLACK}>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Slack
                          </div>
                        </SelectItem>
                        <SelectItem value={NotificationType.DISCORD}>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Discord
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel-config">Configuration (JSON)</Label>
                    <CodeEditor
                      value={channelConfig}
                      onChange={setChannelConfig}
                      language="json"
                      placeholder={getConfigPlaceholder()}
                      height="150px"
                    />
                    <p className="text-xs text-muted-foreground">
                      {channelType === NotificationType.EMAIL &&
                        "Provide an array of email addresses"}
                      {channelType === NotificationType.WEBHOOK &&
                        "Provide webhook URL and optional headers"}
                      {channelType === NotificationType.SLACK &&
                        "Provide your Slack webhook URL"}
                      {channelType === NotificationType.DISCORD &&
                        "Provide your Discord webhook URL"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setChannelDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChannel}
                    disabled={
                      !channelName ||
                      !channelConfig ||
                      createChannelMutation.isPending
                    }
                  >
                    {createChannelMutation.isPending
                      ? "Creating..."
                      : "Create Channel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedOrgId ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Select an organization to manage notification channels
              </p>
            </div>
          ) : channels && channels.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                No notification channels configured
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Add a channel to start receiving alerts
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {channels?.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <NotificationChannelIcon type={channel.type} />
                    </div>
                    <div>
                      <h4 className="font-medium">{channel.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {channel.type}
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant={channel.isActive ? "default" : "secondary"}
                        >
                          {channel.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteChannel(channel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
