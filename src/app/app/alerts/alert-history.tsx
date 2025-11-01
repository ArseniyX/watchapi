"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export type AlertHistoryItem = {
  id: string;
  status: string;
  statusCode?: number | null;
  errorMessage?: string | null;
  responseTime?: number | null;
  checkedAt: string | Date;
  endpointName: string;
  endpointUrl: string;
};

type AlertHistoryProps = {
  failedChecks: AlertHistoryItem[];
};

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

function StatusIcon({ status }: { status: string }) {
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
}

export function AlertHistory({ failedChecks }: AlertHistoryProps) {
  const sortedChecks = useMemo(() => {
    return [...failedChecks]
      .sort(
        (a, b) =>
          new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime(),
      )
      .slice(0, 50);
  }, [failedChecks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>
          Recent failed checks across all endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedChecks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-muted-foreground mb-2">No alerts</p>
            <p className="text-sm text-muted-foreground">
              All endpoints are healthy!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
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
                {sortedChecks.map((check, index) => (
                  <TableRow key={`${check.id}-${index}`}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusIcon status={check.status} />
                        <Badge
                          variant={
                            check.status === "TIMEOUT" ? "secondary" : "destructive"
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
  );
}
