"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { AlertCondition } from "@/generated/prisma";
import {
  Activity,
  AlertTriangle,
  BellRing,
  History,
  Loader2,
  PlayCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/app";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type EndpointSummary =
  RouterOutputs["apiEndpoint"]["getMyEndpoints"][number];
type MonitoringCheck = NonNullable<
  EndpointSummary["monitoringChecks"]
>[number];

interface EndpointDetailsDrawerProps {
  endpoint: EndpointSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALERT_CONDITION_LABELS: Record<AlertCondition, string> = {
  [AlertCondition.RESPONSE_TIME_ABOVE]: "Response time above",
  [AlertCondition.RESPONSE_TIME_BELOW]: "Response time below",
  [AlertCondition.STATUS_CODE_NOT]: "Status code mismatch",
  [AlertCondition.UPTIME_BELOW]: "Uptime below",
  [AlertCondition.ERROR_RATE_ABOVE]: "Error rate above",
};

function formatDuration(ms?: number | null) {
  if (!ms && ms !== 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function intervalToString(interval: number) {
  if (interval >= 3600000) {
    const hours = Math.round(interval / 3600000);
    return `${hours}h`;
  }
  if (interval >= 60000) {
    const minutes = Math.round(interval / 60000);
    return `${minutes}m`;
  }
  return `${Math.max(interval / 1000, 1)}s`;
}

function StatusPill({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    SUCCESS: "default",
    ERROR: "destructive",
    FAILURE: "destructive",
    TIMEOUT: "secondary",
  };

  return (
    <Badge variant={variants[status] || "secondary"}>
      {status.toLowerCase()}
    </Badge>
  );
}

export function EndpointDetailsDrawer({
  endpoint,
  open,
  onOpenChange,
}: EndpointDetailsDrawerProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const endpointId = endpoint?.id ?? "";
  const [activeTab, setActiveTab] = useState("summary");

  const [alertName, setAlertName] = useState("");
  const [alertCondition, setAlertCondition] = useState<AlertCondition>(
    AlertCondition.STATUS_CODE_NOT,
  );
  const [alertThreshold, setAlertThreshold] = useState<number>(200);
  const [alertIsActive, setAlertIsActive] = useState(true);

  useEffect(() => {
    if (!endpoint) return;
    setAlertName(`${endpoint.name || endpoint.url} alert`);
    setAlertThreshold(endpoint.expectedStatus ?? 200);
    setAlertCondition(AlertCondition.STATUS_CODE_NOT);
    setAlertIsActive(true);
  }, [endpoint]);

  const {
    data: history,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = trpc.monitoring.getHistory.useQuery(
    { endpointId, take: 20 },
    { enabled: open && !!endpointId },
  );

  const {
    data: alerts,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = trpc.alert.getByEndpoint.useQuery(
    { apiEndpointId: endpointId },
    { enabled: open && !!endpointId },
  );

  const runCheckMutation = trpc.monitoring.checkEndpoint.useMutation({
    onSuccess: async () => {
      toast({
        title: "Manual check started",
        description: "The endpoint has been queued for an immediate check.",
      });
      await Promise.all([
        utils.monitoring.getHistory.invalidate({ endpointId, take: 20 }),
        utils.apiEndpoint.getMyEndpoints.invalidate(),
        utils.monitoring.getRecentFailures.invalidate(),
        utils.monitoring.getUptimeStats.invalidate({
          endpointId,
          days: 30,
        }),
      ]);
      setActiveTab("history");
    },
    onError: (error) => {
      toast({
        title: "Manual check failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAlertMutation = trpc.alert.create.useMutation({
    onSuccess: async () => {
      toast({
        title: "Alert created",
        description: "This monitor will now raise notifications when matched.",
      });
      await refetchAlerts();
    },
    onError: (error) => {
      toast({
        title: "Failed to create alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAlertMutation = trpc.alert.update.useMutation({
    onSuccess: async () => {
      await refetchAlerts();
    },
    onError: (error) => {
      toast({
        title: "Failed to update alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = trpc.alert.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: "Alert deleted",
        description: "The alert and associated triggers were removed.",
      });
      await refetchAlerts();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const latestCheck = useMemo<MonitoringCheck | undefined>(() => {
    if (!endpoint?.monitoringChecks?.length) return undefined;
    return endpoint.monitoringChecks[0];
  }, [endpoint?.monitoringChecks]);

  const handleRunCheck = () => {
    if (!endpointId) return;
    runCheckMutation.mutate({ id: endpointId });
  };

  const handleCreateAlert = async () => {
    if (!endpointId) return;
    if (!alertName.trim()) {
      toast({
        title: "Name required",
        description: "Give the alert a short, descriptive name.",
        variant: "destructive",
      });
      return;
    }

    await createAlertMutation.mutateAsync({
      name: alertName.trim(),
      description: "",
      apiEndpointId: endpointId,
      condition: alertCondition,
      threshold: alertThreshold,
      isActive: alertIsActive,
    });
  };

  const handleAlertToggle = (id: string, value: boolean) => {
    updateAlertMutation.mutate({
      id,
      isActive: value,
    });
  };

  const handleAlertDelete = (id: string) => {
    deleteAlertMutation.mutate({ id });
  };

  const renderSummary = (): ReactNode => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Current health</span>
            <StatusPill status={latestCheck?.status || "unknown"} />
          </CardTitle>
          <CardDescription>
            {latestCheck?.checkedAt
              ? `Last checked ${formatDistanceToNow(
                  new Date(latestCheck.checkedAt),
                  {
                    addSuffix: true,
                  },
                )}`
              : "Not checked yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expected status</span>
            <span className="font-medium">{endpoint?.expectedStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Check interval</span>
            <span className="font-medium">
              {endpoint?.interval ? intervalToString(endpoint.interval) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Timeout</span>
            <span className="font-medium">
              {formatDuration(endpoint?.timeout)}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last response time</span>
            <span className="font-medium">
              {formatDuration(latestCheck?.responseTime)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Last message</span>
            <span className="font-mono text-sm">
              {latestCheck?.errorMessage || "OK"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          className="flex-1"
          onClick={handleRunCheck}
          disabled={runCheckMutation.isPending || !endpointId}
        >
          {runCheckMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 h-4 w-4" />
          )}
          Run Check Now
        </Button>
        <Badge variant={endpoint?.isActive ? "default" : "secondary"}>
          {endpoint?.isActive ? "Scheduled" : "Paused"}
        </Badge>
      </div>
    </div>
  );

  const renderHistory = (): ReactNode => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Check history
        </CardTitle>
        <CardDescription>
          20 most recent checks for this endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {historyLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading history...
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
            <Activity className="h-6 w-6" />
            <span>No checks recorded yet</span>
          </div>
        ) : (
          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
            {history.map((check) => (
              <div
                key={check.id}
                className="rounded-md border border-border p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <StatusPill status={check.status} />
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(check.checkedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">
                      Status code
                    </span>
                    <div>{check.statusCode ?? "—"}</div>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      Response time
                    </span>
                    <div>{formatDuration(check.responseTime)}</div>
                  </div>
                </div>
                {check.errorMessage && (
                  <p className="mt-2 text-xs font-mono text-red-500">
                    {check.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchHistory()}
          disabled={historyLoading}
        >
          Refresh
        </Button>
      </CardContent>
    </Card>
  );

  const renderAlerts = (): ReactNode => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            Active alerts
          </CardTitle>
          <CardDescription>
            Configure the conditions that should trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertsLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading alerts...
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              No alerts configured yet. Create one below to start receiving
              notifications.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{alert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {
                        ALERT_CONDITION_LABELS[
                          alert.condition as AlertCondition
                        ]
                      }{" "}
                      {alert.condition === AlertCondition.STATUS_CODE_NOT
                        ? `!= ${alert.threshold}`
                        : `>${alert.threshold}`}
                    </p>
                    {alert.lastTriggered && (
                      <p className="text-xs text-muted-foreground">
                        Last triggered{" "}
                        {formatDistanceToNow(new Date(alert.lastTriggered), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={(value) =>
                          handleAlertToggle(alert.id, value)
                        }
                        disabled={updateAlertMutation.isPending}
                      />
                      <span className="text-xs text-muted-foreground">
                        {alert.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAlertDelete(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create alert</CardTitle>
          <CardDescription>
            STATUS_CODE_NOT with threshold 200 will match the manual flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="alert-name">Alert name</Label>
            <Input
              id="alert-name"
              value={alertName}
              placeholder="Status mismatch"
              onChange={(event) => setAlertName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alert-condition">Condition</Label>
            <Select
              value={alertCondition}
              onValueChange={(value) =>
                setAlertCondition(value as AlertCondition)
              }
            >
              <SelectTrigger id="alert-condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AlertCondition).map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {ALERT_CONDITION_LABELS[condition]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alert-threshold">Threshold</Label>
            <Input
              id="alert-threshold"
              type="number"
              value={alertThreshold}
              onChange={(event) =>
                setAlertThreshold(Number(event.target.value) || 0)
              }
              min={0}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Alert active</p>
              <p className="text-xs text-muted-foreground">
                Disable to keep the rule but mute notifications.
              </p>
            </div>
            <Switch
              checked={alertIsActive}
              onCheckedChange={setAlertIsActive}
            />
          </div>
          <Button
            onClick={handleCreateAlert}
            disabled={createAlertMutation.isPending || !endpointId}
          >
            {createAlertMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Create alert
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0 border-b border-border">
          <SheetTitle className="flex flex-col gap-1">
            <span className="text-lg font-semibold">
              {endpoint?.name || endpoint?.url || "Endpoint"}
            </span>
            {endpoint?.name && (
              <span className="text-sm font-normal text-muted-foreground">
                {endpoint?.url}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            {endpoint?.method}
            <span>•</span>
            {endpoint?.id}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full flex-1 flex-col"
          >
            <div className="border-b border-border px-4">
              <TabsList className="h-10 bg-transparent">
                <TabsTrigger value="summary" className="text-xs">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs">
                  History
                </TabsTrigger>
                <TabsTrigger value="alerts" className="text-xs">
                  Alerts
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="summary"
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              {renderSummary()}
            </TabsContent>
            <TabsContent
              value="history"
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              {renderHistory()}
            </TabsContent>
            <TabsContent
              value="alerts"
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              {renderAlerts()}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default EndpointDetailsDrawer;
