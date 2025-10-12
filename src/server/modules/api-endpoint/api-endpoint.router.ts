import { router, orgProcedure } from "../../trpc";
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
    create: orgProcedure
      .input(createApiEndpointSchema)
      .mutation(async ({ ctx, input }) => {
        return await apiEndpointService.createApiEndpoint({ ctx, input });
      }),

    get: orgProcedure
      .input(getApiEndpointSchema)
      .query(async ({ ctx, input }) => {
        return apiEndpointService.getApiEndpoint({ ctx, input });
      }),

    getMyEndpoints: orgProcedure.query(async ({ ctx }) => {
      return apiEndpointService.getOrganizationApiEndpoints({ ctx });
    }),

    getOrganizationEndpoints: orgProcedure
      .input(getOrganizationEndpointsSchema)
      .query(async ({ ctx, input }) => {
        return apiEndpointService.getOrganizationApiEndpoints({ ctx });
      }),

    update: orgProcedure
      .input(getApiEndpointSchema.merge(updateApiEndpointSchema))
      .mutation(async ({ ctx, input }) => {
        return apiEndpointService.updateApiEndpoint({ ctx, input });
      }),

    delete: orgProcedure
      .input(deleteApiEndpointSchema)
      .mutation(async ({ ctx, input }) => {
        return apiEndpointService.deleteApiEndpoint({ ctx, input });
      }),

    search: orgProcedure
      .input(searchEndpointsSchema)
      .query(async ({ ctx, input }) => {
        return apiEndpointService.searchEndpoints({ ctx, input });
      }),
  });
