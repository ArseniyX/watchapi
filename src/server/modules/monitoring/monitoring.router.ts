import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { MonitoringService } from "./monitoring.service";
import { HttpMethod } from "../../../generated/prisma";

export const createMonitoringRouter = (monitoringService: MonitoringService) =>
    router({
        checkEndpoint: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return monitoringService.checkApiEndpoint(input.id);
            }),

        sendRequest: protectedProcedure
            .input(
                z.object({
                    url: z.string(),
                    method: z.nativeEnum(HttpMethod),
                    headers: z.record(z.string(), z.string()).optional(),
                    body: z.string().optional(),
                })
            )
            .mutation(async ({ input }) => {
                return monitoringService.sendRequest(input);
            }),

        getHistory: protectedProcedure
            .input(
                z.object({
                    endpointId: z.string(),
                    skip: z.number().default(0),
                    take: z.number().default(50),
                })
            )
            .query(async ({ input }) => {
                return monitoringService.getMonitoringHistory(
                    input.endpointId,
                    {
                        skip: input.skip,
                        take: input.take,
                    }
                );
            }),

        getUptimeStats: protectedProcedure
            .input(
                z.object({
                    endpointId: z.string(),
                    days: z.number().default(30),
                })
            )
            .query(async ({ input }) => {
                return monitoringService.getUptimeStats(
                    input.endpointId,
                    input.days
                );
            }),

        getAverageResponseTime: protectedProcedure
            .input(
                z.object({
                    endpointId: z.string(),
                    days: z.number().default(30),
                })
            )
            .query(async ({ input }) => {
                return monitoringService.getAverageResponseTime(
                    input.endpointId,
                    input.days
                );
            }),

        getResponseTimeHistory: protectedProcedure
            .input(
                z.object({
                    endpointId: z.string(),
                    days: z.number().default(7),
                })
            )
            .query(async ({ input }) => {
                return monitoringService.getResponseTimeHistory(
                    input.endpointId,
                    input.days
                );
            }),

        // Analytics endpoints
        getAnalytics: protectedProcedure
            .input(
                z.object({
                    days: z.number().default(7),
                })
            )
            .query(async ({ input, ctx }) => {
                return monitoringService.getAnalytics(ctx.user.id, input.days);
            }),

        getTopEndpoints: protectedProcedure
            .input(
                z.object({
                    days: z.number().default(7),
                    limit: z.number().default(5),
                })
            )
            .query(async ({ input, ctx }) => {
                return monitoringService.getTopEndpoints(
                    ctx.user.id,
                    input.days,
                    input.limit
                );
            }),

        getResponseTimeChart: protectedProcedure
            .input(
                z.object({
                    days: z.number().default(7),
                })
            )
            .query(async ({ input, ctx }) => {
                return monitoringService.getResponseTimeChart(
                    ctx.user.id,
                    input.days
                );
            }),

        getUptimeChart: protectedProcedure
            .input(
                z.object({
                    days: z.number().default(7),
                })
            )
            .query(async ({ input, ctx }) => {
                return monitoringService.getUptimeChart(
                    ctx.user.id,
                    input.days
                );
            }),
    });
