import {
    ApiEndpoint,
    HttpMethod,
    CheckStatus,
} from "../../../generated/prisma";
import { MonitoringRepository } from "./monitoring.repository";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import { emailService } from "../shared/email.service";

export interface MonitoringCheckResult {
    status: CheckStatus;
    responseTime?: number;
    statusCode?: number;
    errorMessage?: string;
    responseSize?: number;
}

export class MonitoringService {
    // Track last alert time per endpoint to prevent alert spam
    private lastAlertTime: Map<string, number> = new Map();
    private readonly ALERT_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

    constructor(
        private readonly monitoringRepository: MonitoringRepository,
        private readonly apiEndpointRepository: ApiEndpointRepository
    ) {}

    async sendRequest(input: {
        url: string;
        method: HttpMethod;
        headers?: Record<string, string>;
        body?: string;
    }): Promise<{
        status: number;
        statusText: string;
        headers: Record<string, string>;
        body: string;
        responseTime: number;
        responseSize: number;
    }> {
        // Validate URL
        if (!input.url || input.url.trim() === "") {
            throw new Error("URL is required");
        }

        try {
            new URL(input.url);
        } catch {
            throw new Error("Invalid URL format");
        }

        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(input.url, {
                method: input.method,
                headers: input.headers || {},
                body: input.body || undefined,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            const responseText = await response.text();
            const responseSize = new TextEncoder().encode(responseText).length;

            // Convert response headers to object
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            return {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                body: responseText,
                responseTime,
                responseSize,
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";

            return {
                status: 0,
                statusText: "Error",
                headers: {},
                body: JSON.stringify({ error: errorMessage }),
                responseTime,
                responseSize: 0,
            };
        }
    }

    async checkApiEndpoint(
        apiEndpointId: string
    ): Promise<MonitoringCheckResult> {
        const endpoint = await this.apiEndpointRepository.findById(
            apiEndpointId
        );
        if (!endpoint) {
            throw new Error("API endpoint not found");
        }

        const startTime = Date.now();

        try {
            const headers = endpoint.headers
                ? JSON.parse(endpoint.headers)
                : {};
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                endpoint.timeout
            );

            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                body: endpoint.body || undefined,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            const responseText = await response.text();
            const responseSize = new TextEncoder().encode(responseText).length;

            const result: MonitoringCheckResult = {
                status:
                    response.status === endpoint.expectedStatus
                        ? CheckStatus.SUCCESS
                        : CheckStatus.FAILURE,
                responseTime,
                statusCode: response.status,
                responseSize,
            };

            if (response.status !== endpoint.expectedStatus) {
                result.errorMessage = `Expected status ${endpoint.expectedStatus}, got ${response.status}`;
            }

            // Save the check result
            await this.monitoringRepository.createMonitoringCheck({
                apiEndpointId,
                userId: endpoint.userId,
                status: result.status,
                responseTime: result.responseTime || null,
                statusCode: result.statusCode || null,
                errorMessage: result.errorMessage || null,
                responseSize: result.responseSize || null,
            });

            // Send alert if check failed
            if (result.status !== CheckStatus.SUCCESS) {
                await this.sendAlert(endpoint, result);
            }

            return result;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";

            const result: MonitoringCheckResult = {
                status:
                    (error as Error).name === "AbortError"
                        ? CheckStatus.TIMEOUT
                        : CheckStatus.ERROR,
                responseTime:
                    (error as Error).name === "AbortError"
                        ? endpoint.timeout
                        : responseTime,
                errorMessage,
            };

            // Save the error result
            await this.monitoringRepository.createMonitoringCheck({
                apiEndpointId,
                userId: endpoint.userId,
                status: result.status,
                responseTime: result.responseTime || null,
                statusCode: null,
                errorMessage: result.errorMessage || null,
                responseSize: null,
            });

            // Send alert for errors/timeouts
            await this.sendAlert(endpoint, result);

            return result;
        }
    }

    private async sendAlert(
        endpoint: ApiEndpoint,
        result: MonitoringCheckResult
    ): Promise<void> {
        const now = Date.now();
        const lastAlert = this.lastAlertTime.get(endpoint.id);

        // Check if we should throttle (skip alert if sent within last hour)
        if (lastAlert && now - lastAlert < this.ALERT_THROTTLE_MS) {
            console.log(
                `Alert throttled for endpoint ${
                    endpoint.name
                } (last alert: ${Math.floor((now - lastAlert) / 60000)}m ago)`
            );
            return;
        }

        // Get user email for alert
        const user = await this.monitoringRepository.findUserById(
            endpoint.userId
        );
        if (!user || !user.email) {
            console.log(`No email found for user ${endpoint.userId}`);
            return;
        }

        // Prepare alert data
        const alertData = {
            to: user.email,
            endpointName: endpoint.name,
            endpointUrl: endpoint.url,
            status: result.status,
            statusCode: result.statusCode,
            errorMessage: result.errorMessage,
            responseTime: result.responseTime,
            timestamp: new Date(),
        };

        // Send email alert
        await emailService.sendAlertEmail(alertData);

        // Send webhook alert if configured
        const webhookUrl = process.env.ALERT_WEBHOOK_URL;
        if (webhookUrl) {
            await emailService.sendWebhookAlert(webhookUrl, alertData);
        }

        // Mark alert as sent for throttling
        this.lastAlertTime.set(endpoint.id, now);
    }

    async getMonitoringHistory(
        apiEndpointId: string,
        options: { skip?: number; take?: number } = {}
    ) {
        return this.monitoringRepository.findChecksByApiEndpointId(
            apiEndpointId,
            {
                ...options,
                orderBy: { checkedAt: "desc" },
            }
        );
    }

    async getUptimeStats(apiEndpointId: string, days: number = 30) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return this.monitoringRepository.getUptimeStats(
            apiEndpointId,
            from,
            to
        );
    }

    async getAverageResponseTime(apiEndpointId: string, days: number = 30) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return this.monitoringRepository.getAverageResponseTime(
            apiEndpointId,
            from,
            to
        );
    }

    async getResponseTimeHistory(apiEndpointId: string, days: number = 7) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return this.monitoringRepository.getResponseTimeHistoryByUser(
            apiEndpointId,
            from,
            to
        );
    }

    async runActiveChecks(): Promise<void> {
        const activeEndpoints = await this.apiEndpointRepository.findActive();

        for (const endpoint of activeEndpoints) {
            try {
                await this.checkApiEndpoint(endpoint.id);
            } catch (error) {
                console.error(
                    `Failed to check endpoint ${endpoint.id}:`,
                    error
                );
            }
        }
    }

    // Analytics methods
    async getAnalytics(userId: string, days: number = 7) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        // Get previous period for comparison
        const prevTo = from;
        const prevFrom = new Date(
            prevTo.getTime() - days * 24 * 60 * 60 * 1000
        );

        const [currentStats, previousStats] = await Promise.all([
            this.monitoringRepository.getOverallStats(userId, from, to),
            this.monitoringRepository.getOverallStats(userId, prevFrom, prevTo),
        ]);

        // Calculate changes
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            current: currentStats,
            previous: previousStats,
            changes: {
                totalChecks: calculateChange(
                    currentStats.totalChecks,
                    previousStats.totalChecks
                ),
                avgResponseTime: calculateChange(
                    currentStats.avgResponseTime,
                    previousStats.avgResponseTime
                ),
                errorRate: calculateChange(
                    currentStats.errorRate,
                    previousStats.errorRate
                ),
                uptimePercentage: calculateChange(
                    currentStats.uptimePercentage,
                    previousStats.uptimePercentage
                ),
            },
        };
    }

    async getTopEndpoints(userId: string, days: number = 7, limit: number = 5) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return this.monitoringRepository.getTopEndpoints(
            userId,
            from,
            to,
            limit
        );
    }

    async getResponseTimeChart(userId: string, days: number = 7) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return this.monitoringRepository.getResponseTimeHistoryByUser(
            userId,
            from,
            to
        );
    }

    async getUptimeChart(userId: string, days: number = 7) {
        const to = new Date();
        const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

        return this.monitoringRepository.getUptimeHistory(userId, from, to);
    }
}
