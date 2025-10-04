import { router, protectedProcedure } from "../../trpc";
import { ApiEndpointService } from "./api-endpoint.service";
import {
  createApiEndpointSchema,
  updateApiEndpointSchema,
  getApiEndpointSchema,
  deleteApiEndpointSchema,
  getOrganizationEndpointsSchema,
  searchEndpointsSchema,
} from "./api-endpoint.schema";

export const createApiEndpointRouter = (
  apiEndpointService: ApiEndpointService,
) =>
  router({
    create: protectedProcedure
      .input(createApiEndpointSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return apiEndpointService.createApiEndpoint(
          ctx.user.id,
          ctx.user.plan,
          ctx.organizationId,
          input,
        );
      }),

    get: protectedProcedure
      .input(getApiEndpointSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return apiEndpointService.getApiEndpoint(input.id, ctx.organizationId);
      }),

    getMyEndpoints: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      return apiEndpointService.getOrganizationApiEndpoints(ctx.organizationId);
    }),

    getOrganizationEndpoints: protectedProcedure
      .input(getOrganizationEndpointsSchema)
      .query(async ({ input }) => {
        return apiEndpointService.getOrganizationApiEndpoints(
          input.organizationId,
        );
      }),

    update: protectedProcedure
      .input(getApiEndpointSchema.merge(updateApiEndpointSchema))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        const { id, ...updateData } = input;
        return apiEndpointService.updateApiEndpoint(
          ctx.user.id,
          ctx.user.plan,
          ctx.organizationId,
          id,
          updateData,
        );
      }),

    delete: protectedProcedure
      .input(deleteApiEndpointSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return apiEndpointService.deleteApiEndpoint(
          ctx.organizationId,
          input.id,
        );
      }),

    search: protectedProcedure
      .input(searchEndpointsSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return apiEndpointService.searchEndpoints(
          ctx.organizationId,
          input.query,
        );
      }),
  });
