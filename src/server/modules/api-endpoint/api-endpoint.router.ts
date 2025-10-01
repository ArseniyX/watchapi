import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { ApiEndpointService } from "./api-endpoint.service";
import { HttpMethod } from "../../../generated/prisma";

export const createApiEndpointRouter = (
    apiEndpointService: ApiEndpointService
) =>
    router({
        create: protectedProcedure
            .input(
                z.object({
                    name: z.string(),
                    url: z.string(),
                    method: z.nativeEnum(HttpMethod).default(HttpMethod.GET),
                    headers: z.record(z.string(), z.string()).optional(),
                    body: z.string().optional(),
                    expectedStatus: z.number().default(200),
                    timeout: z.number().default(30000),
                    interval: z.number().default(300000), // 5 minutes
                    collectionId: z.string().optional(),
                })
            )
            .mutation(async ({ input, ctx }) => {
                return apiEndpointService.createApiEndpoint(ctx.user.id, input);
            }),

        get: protectedProcedure
            .input(z.object({ id: z.string() }))
            .query(async ({ input }) => {
                return apiEndpointService.getApiEndpoint(input.id);
            }),

        getMyEndpoints: protectedProcedure.query(async ({ ctx }) => {
            return apiEndpointService.getUserApiEndpoints(ctx.user.id);
        }),

        getOrganizationEndpoints: protectedProcedure
            .input(z.object({ organizationId: z.string() }))
            .query(async ({ input }) => {
                return apiEndpointService.getOrganizationApiEndpoints(
                    input.organizationId
                );
            }),

        update: protectedProcedure
            .input(
                z.object({
                    id: z.string(),
                    name: z.string().optional(),
                    url: z.string().optional(),
                    method: z.nativeEnum(HttpMethod).optional(),
                    headers: z.record(z.string(), z.string()).optional(),
                    body: z.string().optional(),
                    expectedStatus: z.number().optional(),
                    timeout: z.number().optional(),
                    interval: z.number().optional(),
                    isActive: z.boolean().optional(),
                })
            )
            .mutation(async ({ input, ctx }) => {
                const { id, ...updateData } = input;
                return apiEndpointService.updateApiEndpoint(
                    ctx.user.id,
                    id,
                    updateData
                );
            }),

        delete: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input, ctx }) => {
                return apiEndpointService.deleteApiEndpoint(
                    ctx.user.id,
                    input.id
                );
            }),

        search: protectedProcedure
            .input(z.object({ query: z.string() }))
            .query(async ({ input, ctx }) => {
                return apiEndpointService.searchEndpoints(
                    ctx.user.id,
                    input.query
                );
            }),
    });
