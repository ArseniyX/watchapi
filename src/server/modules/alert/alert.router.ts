import { router, orgProcedure } from "../../trpc";
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
    create: orgProcedure
      .input(createAlertSchema)
      .mutation(async ({ input, ctx }) => {
        return alertService.createAlert({ input, ctx });
      }),

    getById: orgProcedure
      .input(getAlertSchema)
      .query(async ({ input, ctx }) => {
        return alertService.getAlert({ input, ctx });
      }),

    getByEndpoint: orgProcedure
      .input(getAlertsByEndpointSchema)
      .query(async ({ input, ctx }) => {
        return alertService.getAlertsByEndpoint({ input, ctx });
      }),

    getByOrganization: orgProcedure.query(async ({ ctx }) => {
      return alertService.getAlertsByOrganization({ ctx });
    }),

    update: orgProcedure
      .input(getAlertSchema.and(updateAlertSchema))
      .mutation(async ({ input, ctx }) => {
        return alertService.updateAlert({ input, ctx });
      }),

    delete: orgProcedure
      .input(deleteAlertSchema)
      .mutation(async ({ input, ctx }) => {
        return alertService.deleteAlert({ input, ctx });
      }),

    // Alert Notification management
    createNotification: orgProcedure
      .input(createAlertNotificationSchema)
      .mutation(async ({ input, ctx }) => {
        return alertService.createAlertNotification({ input, ctx });
      }),

    deleteNotification: orgProcedure
      .input(deleteAlertNotificationSchema)
      .mutation(async ({ input, ctx }) => {
        return alertService.deleteAlertNotification({ input, ctx });
      }),

    // Alert Triggers (history)
    getTriggers: orgProcedure
      .input(getAlertTriggersSchema)
      .query(async ({ input, ctx }) => {
        return alertService.getAlertTriggers({ input, ctx });
      }),
  });
