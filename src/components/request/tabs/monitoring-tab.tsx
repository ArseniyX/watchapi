"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle } from "lucide-react";

interface MonitoringTabProps {
  isActive: boolean;
  interval: number;
  expectedStatus: number;
  timeout: number;
  onIsActiveChange: (value: boolean) => void;
  onIntervalChange: (value: number) => void;
  onExpectedStatusChange: (value: number) => void;
  onTimeoutChange: (value: number) => void;
  planLimit?: {
    maxActiveMonitors: number;
    currentActiveMonitors: number;
    minCheckInterval: number;
  };
}

export function MonitoringTab({
  isActive,
  interval,
  expectedStatus,
  timeout,
  onIsActiveChange,
  onIntervalChange,
  onExpectedStatusChange,
  onTimeoutChange,
  planLimit,
}: MonitoringTabProps) {
  const isAtLimit =
    planLimit &&
    planLimit.currentActiveMonitors >= planLimit.maxActiveMonitors &&
    !isActive;

  const intervalMinutes = Math.floor(interval / 60000);
  const minIntervalMinutes = planLimit
    ? Math.floor(planLimit.minCheckInterval / 60000)
    : 1;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl space-y-6 p-4">
        {/* Enable Monitoring Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <Label
                htmlFor="monitoring-enabled"
                className="text-base font-medium cursor-pointer"
              >
                Enable Monitoring
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically check this endpoint at regular intervals
              </p>
            </div>
          </div>
          <Switch
            id="monitoring-enabled"
            checked={isActive}
            onCheckedChange={onIsActiveChange}
            disabled={isAtLimit}
          />
        </div>

        {/* Plan Limit Warning */}
        {isAtLimit && (
          <div className="flex items-start gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">
                Monitor limit reached
              </p>
              <p className="text-yellow-800 dark:text-yellow-300">
                You have {planLimit.currentActiveMonitors} of{" "}
                {planLimit.maxActiveMonitors} active monitors. Disable
                monitoring on other endpoints or upgrade your plan.
              </p>
            </div>
          </div>
        )}

        {/* Monitoring Configuration */}
        {isActive && (
          <div className="space-y-4">
            {/* Check Interval */}
            <div className="space-y-2">
              <Label htmlFor="check-interval">Check Interval</Label>
              <Select
                value={interval.toString()}
                onValueChange={(value) => onIntervalChange(parseInt(value))}
              >
                <SelectTrigger id="check-interval">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {/* {minIntervalMinutes <= 1 && (
                    <SelectItem value="60000">Every 1 minute</SelectItem>
                  )}
                  {minIntervalMinutes <= 2 && (
                    <SelectItem value="120000">Every 2 minutes</SelectItem>
                  )}
                  {minIntervalMinutes <= 5 && (
                    <SelectItem value="300000">Every 5 minutes</SelectItem>
                  )}
                  {minIntervalMinutes <= 10 && (
                    <SelectItem value="600000">Every 10 minutes</SelectItem>
                  )} */}
                  {minIntervalMinutes <= 30 && (
                    <SelectItem value="1800000">Every 30 minutes</SelectItem>
                  )}
                  <SelectItem value="3600000">Every 1 hour</SelectItem>
                  <SelectItem value="21600000">Every 6 hours</SelectItem>
                  <SelectItem value="86400000">Every 24 hours</SelectItem>
                </SelectContent>
              </Select>
              {planLimit && (
                <p className="text-xs text-muted-foreground">
                  Minimum interval for your plan: {minIntervalMinutes}{" "}
                  {minIntervalMinutes === 1 ? "minute" : "minutes"}
                </p>
              )}
            </div>

            {/* Expected Status Code */}
            <div className="space-y-2">
              <Label htmlFor="expected-status">Expected Status Code</Label>
              <Input
                id="expected-status"
                type="number"
                min="100"
                max="599"
                value={expectedStatus}
                onChange={(e) =>
                  onExpectedStatusChange(parseInt(e.target.value) || 200)
                }
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                The HTTP status code you expect from a healthy response
              </p>
            </div>

            {/* Request Timeout */}
            <div className="space-y-2">
              <Label htmlFor="timeout">Request Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                min="1000"
                max="60000"
                step="1000"
                value={timeout}
                onChange={(e) =>
                  onTimeoutChange(parseInt(e.target.value) || 30000)
                }
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Maximum time to wait for a response (1000-60000ms)
              </p>
            </div>

            {/* Monitoring Status */}
            {/* <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-500/20"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Monitoring Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This endpoint will be checked every {intervalMinutes}{" "}
                {intervalMinutes === 1 ? "minute" : "minutes"}. You'll be
                notified if the response status is not {expectedStatus} or if
                the request times out.
              </p>
            </div> */}
          </div>
        )}

        {/* Inactive State Info */}
        {!isActive && !isAtLimit && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Monitoring is currently disabled. This endpoint is saved for
              testing but won't be automatically checked. Enable monitoring to
              track uptime and performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
