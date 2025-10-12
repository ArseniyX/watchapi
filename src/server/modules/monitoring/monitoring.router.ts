import { router, protectedProcedure, orgProcedure } from "../../trpc";
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
    checkEndpoint: orgProcedure
      .input(checkEndpointSchema)
      .mutation(async ({ input, ctx }) => {
        return monitoringService.checkApiEndpoint({ input, ctx });
      }),

    sendRequest: protectedProcedure
      .input(sendRequestSchema)
      .mutation(async ({ input }) => {
        return monitoringService.sendRequest({ input });
      }),

    getHistory: orgProcedure
      .input(getHistorySchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getMonitoringHistory({ input, ctx });
      }),

    getUptimeStats: orgProcedure
      .input(getUptimeStatsSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getUptimeStats({ input, ctx });
      }),

    getAverageResponseTime: orgProcedure
      .input(getAverageResponseTimeSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getAverageResponseTime({ input, ctx });
      }),

    getResponseTimeHistory: orgProcedure
      .input(getResponseTimeHistorySchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getResponseTimeHistory({ input, ctx });
      }),

    getAnalytics: orgProcedure
      .input(getAnalyticsSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getAnalytics({ input, ctx });
      }),

    getTopEndpoints: orgProcedure
      .input(getTopEndpointsSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getTopEndpoints({ input, ctx });
      }),

    getResponseTimeChart: orgProcedure
      .input(getResponseTimeChartSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getResponseTimeChart({ input, ctx });
      }),

    getUptimeChart: orgProcedure
      .input(getUptimeChartSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getUptimeChart({ input, ctx });
      }),

    getRecentFailures: orgProcedure
      .input(getRecentFailuresSchema)
      .query(async ({ input, ctx }) => {
        return monitoringService.getRecentFailures({ input, ctx });
      }),
  });
