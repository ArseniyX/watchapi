import { z } from 'zod'
import { router, protectedProcedure } from '../../trpc'
import { MonitoringService } from './monitoring.service'
import { HttpMethod } from '../../../generated/prisma'

export const createMonitoringRouter = (monitoringService: MonitoringService) =>
  router({
    createEndpoint: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          url: z.string(),
          method: z.nativeEnum(HttpMethod).default(HttpMethod.GET),
          headers: z.record(z.string()).optional(),
          body: z.string().optional(),
          expectedStatus: z.number().default(200),
          timeout: z.number().default(30000),
          interval: z.number().default(300000), // 5 minutes
          collectionId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return monitoringService.createApiEndpoint(ctx.user.id, input)
      }),

    getEndpoint: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return monitoringService.getApiEndpoint(input.id)
      }),

    getMyEndpoints: protectedProcedure
      .query(async ({ ctx }) => {
        return monitoringService.getUserApiEndpoints(ctx.user.id)
      }),

    updateEndpoint: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          url: z.string().optional(),
          method: z.nativeEnum(HttpMethod).optional(),
          headers: z.record(z.string()).optional(),
          body: z.string().optional(),
          expectedStatus: z.number().optional(),
          timeout: z.number().optional(),
          interval: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input
        return monitoringService.updateApiEndpoint(id, updateData)
      }),

    deleteEndpoint: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return monitoringService.deleteApiEndpoint(input.id)
      }),

    checkEndpoint: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return monitoringService.checkApiEndpoint(input.id)
      }),

    sendRequest: protectedProcedure
      .input(
        z.object({
          url: z.string(),
          method: z.nativeEnum(HttpMethod),
          headers: z.record(z.string()).optional(),
          body: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return monitoringService.sendRequest(input)
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
        return monitoringService.getMonitoringHistory(input.endpointId, {
          skip: input.skip,
          take: input.take,
        })
      }),

    getUptimeStats: protectedProcedure
      .input(
        z.object({
          endpointId: z.string(),
          days: z.number().default(30),
        })
      )
      .query(async ({ input }) => {
        return monitoringService.getUptimeStats(input.endpointId, input.days)
      }),

    getAverageResponseTime: protectedProcedure
      .input(
        z.object({
          endpointId: z.string(),
          days: z.number().default(30),
        })
      )
      .query(async ({ input }) => {
        return monitoringService.getAverageResponseTime(input.endpointId, input.days)
      }),

    getResponseTimeHistory: protectedProcedure
      .input(
        z.object({
          endpointId: z.string(),
          days: z.number().default(7),
        })
      )
      .query(async ({ input }) => {
        return monitoringService.getResponseTimeHistory(input.endpointId, input.days)
      }),
  })