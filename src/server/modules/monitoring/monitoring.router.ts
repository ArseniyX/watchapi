import { router, protectedProcedure } from "../../trpc";
import { MonitoringService } from "./monitoring.service";
import {
  checkEndpointSchema,
  sendRequestSchema,
  getHistorySchema,
  getUptimeStatsSchema,
  getAverageResponseTimeSchema,
  getResponseTimeHistorySchema,
  getAnalyticsSchema,
  getTopEndpointsSchema,
  getResponseTimeChartSchema,
  getUptimeChartSchema,
  getRecentFailuresSchema,
} from "./monitoring.schema";

export const createMonitoringRouter = (monitoringService: MonitoringService) =>
  router({
    checkEndpoint: protectedProcedure
      .input(checkEndpointSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.checkApiEndpoint(input.id, ctx.organizationId);
      }),

    sendRequest: protectedProcedure
      .input(sendRequestSchema)
      .mutation(async ({ input }) => {
        return monitoringService.sendRequest(input);
      }),

    getHistory: protectedProcedure
      .input(getHistorySchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getMonitoringHistory(
          input.endpointId,
          ctx.organizationId,
          {
            skip: input.skip,
            take: input.take,
          },
        );
      }),

    getUptimeStats: protectedProcedure
      .input(getUptimeStatsSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getUptimeStats(
          input.endpointId,
          ctx.organizationId,
          input.days,
        );
      }),

    getAverageResponseTime: protectedProcedure
      .input(getAverageResponseTimeSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getAverageResponseTime(
          input.endpointId,
          ctx.organizationId,
          input.days,
        );
      }),

    getResponseTimeHistory: protectedProcedure
      .input(getResponseTimeHistorySchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getResponseTimeHistory(
          input.endpointId,
          ctx.organizationId,
          input.days,
        );
      }),

    // Analytics endpoints
    getAnalytics: protectedProcedure
      .input(getAnalyticsSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getAnalytics(ctx.organizationId, input.days);
      }),

    getTopEndpoints: protectedProcedure
      .input(getTopEndpointsSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getTopEndpoints(
          ctx.organizationId,
          input.days,
          input.limit,
        );
      }),

    getResponseTimeChart: protectedProcedure
      .input(getResponseTimeChartSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getResponseTimeChart(ctx.organizationId, input.days);
      }),

    getUptimeChart: protectedProcedure
      .input(getUptimeChartSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return monitoringService.getUptimeChart(ctx.organizationId, input.days);
      }),

    getRecentFailures: protectedProcedure
      .input(getRecentFailuresSchema)
      .query(async ({ input }) => {
        return monitoringService.getRecentFailures(
          input.organizationId,
          input.limit,
        );
      }),
  });
