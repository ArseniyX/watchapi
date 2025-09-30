"use client";

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
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

export default function AlertsPage() {
    const { data: endpoints } = trpc.monitoring.getMyEndpoints.useQuery();

    // Get failed checks from all endpoints using the monitoringChecks relationship
    const failedChecks: any[] = [];

    endpoints?.forEach((endpoint) => {
        // Use the monitoringChecks that are already loaded with the endpoint
        endpoint.monitoringChecks?.forEach((check) => {
            if (check.status !== "SUCCESS") {
                failedChecks.push({
                    ...check,
                    endpointName: endpoint.name,
                    endpointUrl: endpoint.url,
                });
            }
        });
    });

    // Sort by most recent
    failedChecks.sort(
        (a, b) =>
            new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    );

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
                    <h1 className="text-3xl font-bold tracking-tight">
                        Alerts
                    </h1>
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
                        <div className="text-2xl font-bold">
                            {totalEndpoints}
                        </div>
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
                        <div className="text-2xl font-bold text-red-500">
                            {todayFailed}
                        </div>
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
                            <p className="text-muted-foreground mb-2">
                                No alerts
                            </p>
                            <p className="text-sm text-muted-foreground">
                                All endpoints are healthy!
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">
                                            Status
                                        </TableHead>
                                        <TableHead className="min-w-[200px]">
                                            Endpoint
                                        </TableHead>
                                        <TableHead className="min-w-[200px]">
                                            Error
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            Status Code
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            Response Time
                                        </TableHead>
                                        <TableHead className="whitespace-nowrap">
                                            Time
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {failedChecks
                                        .slice(0, 50)
                                        .map((check, index) => (
                                            <TableRow
                                                key={`${check.id}-${index}`}
                                            >
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <StatusIcon
                                                            status={
                                                                check.status
                                                            }
                                                        />
                                                        <Badge
                                                            variant={
                                                                check.status ===
                                                                "TIMEOUT"
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
                                                        {check.errorMessage ||
                                                            "No error message"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {check.statusCode ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono"
                                                        >
                                                            {check.statusCode}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            N/A
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm whitespace-nowrap">
                                                    {check.responseTime
                                                        ? `${check.responseTime}ms`
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                                    {formatTime(
                                                        new Date(
                                                            check.checkedAt
                                                        )
                                                    )}
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
                    <CardTitle>Alert Configuration</CardTitle>
                    <CardDescription>
                        Email and webhook alerts are automatically sent when
                        endpoints fail
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start space-x-4 rounded-lg border p-4">
                        <div className="flex-1">
                            <h4 className="font-medium">Email Alerts</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Emails are sent to your account email when an
                                endpoint fails. Max 1 email per endpoint per
                                hour to prevent spam.
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Configure in .env: EMAIL_HOST, EMAIL_USER,
                                EMAIL_PASS
                            </p>
                        </div>
                        <Badge>
                            {process.env.EMAIL_HOST
                                ? "Configured"
                                : "Not Configured"}
                        </Badge>
                    </div>

                    <div className="flex items-start space-x-4 rounded-lg border p-4">
                        <div className="flex-1">
                            <h4 className="font-medium">Webhook Alerts</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                POST requests are sent to your webhook URL with
                                failure details in JSON format.
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Configure in .env: ALERT_WEBHOOK_URL
                            </p>
                        </div>
                        <Badge>
                            {process.env.ALERT_WEBHOOK_URL
                                ? "Configured"
                                : "Not Configured"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
