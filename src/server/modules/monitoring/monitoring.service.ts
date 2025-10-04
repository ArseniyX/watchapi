import { ApiEndpoint, CheckStatus } from "../../../generated/prisma";
import { MonitoringRepository } from "./monitoring.repository";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import { SendRequestInput } from "./monitoring.schema";
import { NotFoundError, ForbiddenError } from "../../errors/custom-errors";
import { logger, logError, logInfo } from "@/lib/logger";
import { AlertService } from "../alert/alert.service";

export interface MonitoringCheckResult {
  status: CheckStatus;
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
  responseSize?: number;
}

export class MonitoringService {
  constructor(
    private readonly monitoringRepository: MonitoringRepository,
    private readonly apiEndpointRepository: ApiEndpointRepository,
    private readonly alertService: AlertService,
  ) {}

  async sendRequest(input: SendRequestInput): Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    responseTime: number;
    responseSize: number;
  }> {
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

      logError("Request failed", error, {
        url: input.url,
        method: input.method,
        responseTime,
      });

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
    apiEndpointId: string,
    organizationId?: string,
  ): Promise<MonitoringCheckResult> {
    let endpoint: ApiEndpoint | null;

    if (organizationId) {
      // User-initiated check - verify organization access
      endpoint = await this.apiEndpointRepository.findById(
        apiEndpointId,
        organizationId,
      );
      if (!endpoint) {
        throw new ForbiddenError("API endpoint not found or access denied");
      }
    } else {
      // System-initiated check (scheduler) - no org filtering
      endpoint =
        await this.apiEndpointRepository.findByIdInternal(apiEndpointId);
      if (!endpoint) {
        throw new NotFoundError("API endpoint", apiEndpointId);
      }
    }

    logInfo("Starting API endpoint check", {
      endpointId: apiEndpointId,
      url: endpoint.url,
      method: endpoint.method,
    });

    const startTime = Date.now();

    try {
      const headers = endpoint.headers ? JSON.parse(endpoint.headers) : {};
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

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
        logger.warn("API check status mismatch", {
          endpointId: apiEndpointId,
          expected: endpoint.expectedStatus,
          actual: response.status,
        });
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

      logInfo("API endpoint check completed", {
        endpointId: apiEndpointId,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
      });

      // Evaluate alerts for this check
      await this.alertService.evaluateAlerts({
        apiEndpointId,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
      });

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

      logError("API endpoint check failed", error, {
        endpointId: apiEndpointId,
        url: endpoint.url,
        status: result.status,
        responseTime: result.responseTime,
      });

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

      // Evaluate alerts for errors/timeouts
      await this.alertService.evaluateAlerts({
        apiEndpointId,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
      });

      return result;
    }
  }

  async getMonitoringHistory(
    apiEndpointId: string,
    organizationId: string,
    options: { skip?: number; take?: number } = {},
  ) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      apiEndpointId,
      organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    return this.monitoringRepository.findChecksByApiEndpointId(apiEndpointId, {
      ...options,
      orderBy: { checkedAt: "desc" },
    });
  }

  async getUptimeStats(
    apiEndpointId: string,
    organizationId: string,
    days: number = 30,
  ) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      apiEndpointId,
      organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getUptimeStats(apiEndpointId, from, to);
  }

  async getAverageResponseTime(
    apiEndpointId: string,
    organizationId: string,
    days: number = 30,
  ) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      apiEndpointId,
      organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getAverageResponseTime(
      apiEndpointId,
      from,
      to,
    );
  }

  async getResponseTimeHistory(
    apiEndpointId: string,
    organizationId: string,
    days: number = 7,
  ) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      apiEndpointId,
      organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getResponseTimeHistoryByUser(
      apiEndpointId,
      from,
      to,
    );
  }

  async runActiveChecks(): Promise<void> {
    const activeEndpoints = await this.apiEndpointRepository.findActive();

    logInfo("Running active checks", {
      totalEndpoints: activeEndpoints.length,
    });

    for (const endpoint of activeEndpoints) {
      try {
        await this.checkApiEndpoint(endpoint.id);
      } catch (error) {
        logError(`Failed to check endpoint ${endpoint.id}`, error, {
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          url: endpoint.url,
        });
      }
    }

    logInfo("Completed active checks", {
      totalEndpoints: activeEndpoints.length,
    });
  }

  // Analytics methods
  async getAnalytics(userId: string, days: number = 7) {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    // Get previous period for comparison
    const prevTo = from;
    const prevFrom = new Date(prevTo.getTime() - days * 24 * 60 * 60 * 1000);

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
          previousStats.totalChecks,
        ),
        avgResponseTime: calculateChange(
          currentStats.avgResponseTime,
          previousStats.avgResponseTime,
        ),
        errorRate: calculateChange(
          currentStats.errorRate,
          previousStats.errorRate,
        ),
        uptimePercentage: calculateChange(
          currentStats.uptimePercentage,
          previousStats.uptimePercentage,
        ),
      },
    };
  }

  async getTopEndpoints(userId: string, days: number = 7, limit: number = 5) {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getTopEndpoints(userId, from, to, limit);
  }

  async getResponseTimeChart(userId: string, days: number = 7) {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getResponseTimeHistoryByUser(
      userId,
      from,
      to,
    );
  }

  async getUptimeChart(userId: string, days: number = 7) {
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getUptimeHistory(userId, from, to);
  }

  async getRecentFailures(organizationId: string, limit: number = 50) {
    return this.monitoringRepository.findRecentFailuresByOrganization(
      organizationId,
      limit,
    );
  }
}
