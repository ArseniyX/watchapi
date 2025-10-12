import { CheckStatus } from "../../../generated/prisma";
import { MonitoringRepository } from "./monitoring.repository";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import {
  CheckEndpointInput,
  GetAnalyticsInput,
  GetAverageResponseTimeInput,
  GetRecentFailuresInput,
  GetResponseTimeChartInput,
  GetResponseTimeHistoryInput,
  GetTopEndpointsInput,
  GetUptimeChartInput,
  GetUptimeStatsInput,
  SendRequestInput,
  GetHistoryInput,
} from "./monitoring.schema";
import { ForbiddenError } from "../../errors/custom-errors";
import { logger, logError, logInfo } from "@/lib/logger";
import { AlertService } from "../alert/alert.service";
import { Context } from "@/server/trpc";

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

  async sendRequest({ input }: { input: SendRequestInput }): Promise<{
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

  async checkApiEndpoint({
    input,
    ctx,
  }: {
    input: CheckEndpointInput;
    ctx: Context;
  }): Promise<MonitoringCheckResult> {
    const endpoint = await this.apiEndpointRepository.findById(
      input.id,
      ctx.organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    logInfo("Starting API endpoint check", {
      endpointId: input.id,
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
          endpointId: input.id,
          expected: endpoint.expectedStatus,
          actual: response.status,
        });
      }

      // Save the check result
      await this.monitoringRepository.createMonitoringCheck({
        apiEndpointId: input.id,
        userId: endpoint.userId,
        status: result.status,
        responseTime: result.responseTime || null,
        statusCode: result.statusCode || null,
        errorMessage: result.errorMessage || null,
        responseSize: result.responseSize || null,
      });

      logInfo("API endpoint check completed", {
        endpointId: input.id,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
      });

      // Evaluate alerts for this check
      await this.alertService.evaluateAlerts({
        apiEndpointId: input.id,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Extract detailed error message, including cause if available
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Include the underlying cause if present (e.g., ENOTFOUND, ECONNREFUSED)
        if (error.cause instanceof Error) {
          errorMessage += ` (${error.cause.message})`;
        }
      }

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
        endpointId: input.id,
        url: endpoint.url,
        status: result.status,
        responseTime: result.responseTime,
      });

      // Save the error result
      await this.monitoringRepository.createMonitoringCheck({
        apiEndpointId: input.id,
        userId: endpoint.userId,
        status: result.status,
        responseTime: result.responseTime || null,
        statusCode: null,
        errorMessage: result.errorMessage || null,
        responseSize: null,
      });

      // Evaluate alerts for errors/timeouts
      await this.alertService.evaluateAlerts({
        apiEndpointId: input.id,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        errorMessage: result.errorMessage,
      });

      return result;
    }
  }

  async getMonitoringHistory({
    input,
    ctx,
  }: {
    input: GetHistoryInput;
    ctx: Context;
  }) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      input.endpointId,
      ctx.organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    return this.monitoringRepository.findChecksByApiEndpointId(
      input.endpointId,
      {
        skip: input.skip,
        take: input.take,
        orderBy: { checkedAt: "desc" },
      },
    );
  }

  async getUptimeStats({
    input,
    ctx,
  }: {
    input: GetUptimeStatsInput;
    ctx: Context;
  }) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      input.endpointId,
      ctx.organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getUptimeStats(input.endpointId, from, to);
  }

  async getAverageResponseTime({
    input,
    ctx,
  }: {
    input: GetAverageResponseTimeInput;
    ctx: Context;
  }) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      input.endpointId,
      ctx.organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getAverageResponseTime(
      input.endpointId,
      from,
      to,
    );
  }

  async getResponseTimeHistory({
    input,
    ctx,
  }: {
    input: GetResponseTimeHistoryInput;
    ctx: Context;
  }) {
    // Verify organization access
    const endpoint = await this.apiEndpointRepository.findById(
      input.endpointId,
      ctx.organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getResponseTimeHistoryByEndpoint(
      input.endpointId,
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
        await this.checkApiEndpoint({
          input: { id: endpoint.id },
          ctx: {
            organizationId: endpoint.organizationId,
          },
        });
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
  async getAnalytics({
    ctx,
    input,
  }: {
    ctx: Context;
    input: GetAnalyticsInput;
  }) {
    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    // Get previous period for comparison
    const prevTo = from;
    const prevFrom = new Date(
      prevTo.getTime() - input.days * 24 * 60 * 60 * 1000,
    );

    const [currentStats, previousStats] = await Promise.all([
      this.monitoringRepository.getOverallStats(ctx.organizationId, from, to),
      this.monitoringRepository.getOverallStats(
        ctx.organizationId,
        prevFrom,
        prevTo,
      ),
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

  async getTopEndpoints({
    input,
    ctx,
  }: {
    input: GetTopEndpointsInput;
    ctx: Context;
  }) {
    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getTopEndpoints(
      ctx.organizationId,
      from,
      to,
      input.limit,
    );
  }

  async getResponseTimeChart({
    input,
    ctx,
  }: {
    input: GetResponseTimeChartInput;
    ctx: Context;
  }) {
    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getResponseTimeHistoryByOrganization(
      ctx.organizationId,
      from,
      to,
    );
  }

  async getUptimeChart({
    input,
    ctx,
  }: {
    input: GetUptimeChartInput;
    ctx: Context;
  }) {
    const to = new Date();
    const from = new Date(to.getTime() - input.days * 24 * 60 * 60 * 1000);

    return this.monitoringRepository.getUptimeHistory(
      ctx.organizationId,
      from,
      to,
    );
  }

  async getRecentFailures({
    ctx,
    input,
  }: {
    ctx: Context;
    input: GetRecentFailuresInput;
  }) {
    return this.monitoringRepository.findRecentFailuresByOrganization(
      ctx.organizationId,
      input.limit,
    );
  }
}
