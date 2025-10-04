import { router, protectedProcedure } from "../../trpc";
import { AlertService } from "./alert.service";
import {
  createAlertSchema,
  updateAlertSchema,
  getAlertSchema,
  deleteAlertSchema,
  getAlertsByEndpointSchema,
  createAlertNotificationSchema,
  deleteAlertNotificationSchema,
  getAlertTriggersSchema,
} from "./alert.schema";

export const createAlertRouter = (alertService: AlertService) =>
  router({
    create: protectedProcedure
      .input(createAlertSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.createAlert(input, ctx.user.id, ctx.organizationId);
      }),

    getById: protectedProcedure
      .input(getAlertSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.getAlert(input.id, ctx.organizationId);
      }),

    getByEndpoint: protectedProcedure
      .input(getAlertsByEndpointSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.getAlertsByEndpoint(
          input.apiEndpointId,
          ctx.organizationId,
        );
      }),

    getByOrganization: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      return alertService.getAlertsByOrganization(ctx.organizationId);
    }),

    update: protectedProcedure
      .input(getAlertSchema.merge(updateAlertSchema))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        const { id, ...updateData } = input;
        return alertService.updateAlert(id, updateData, ctx.organizationId);
      }),

    delete: protectedProcedure
      .input(deleteAlertSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.deleteAlert(input.id, ctx.organizationId);
      }),

    // Alert Notification management
    createNotification: protectedProcedure
      .input(createAlertNotificationSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.createAlertNotification(input, ctx.organizationId);
      }),

    deleteNotification: protectedProcedure
      .input(deleteAlertNotificationSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.deleteAlertNotification(input.id, ctx.organizationId);
      }),

    // Alert Triggers (history)
    getTriggers: protectedProcedure
      .input(getAlertTriggersSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return alertService.getAlertTriggers(
          input.alertId,
          ctx.organizationId,
          input.limit,
        );
      }),
  });
