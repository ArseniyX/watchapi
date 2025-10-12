import { router, orgProcedure } from "../../trpc";
import { NotificationChannelService } from "./notification-channel.service";
import { NotificationChannelRepository } from "./notification-channel.repository";
import { prisma } from "../../database";
import {
  createNotificationChannelSchema,
  updateNotificationChannelSchema,
  deleteNotificationChannelSchema,
  getNotificationChannelsSchema,
  getNotificationChannelSchema,
} from "./notification-channel.schema";

const notificationChannelService = new NotificationChannelService(
  new NotificationChannelRepository(prisma),
);

export const notificationChannelRouter = router({
  create: orgProcedure
    .input(createNotificationChannelSchema)
    .mutation(async ({ input, ctx }) => {
      return notificationChannelService.createNotificationChannel({ input, ctx });
    }),

  update: orgProcedure
    .input(updateNotificationChannelSchema)
    .mutation(async ({ input, ctx }) => {
      return notificationChannelService.updateNotificationChannel({ input, ctx });
    }),

  delete: orgProcedure
    .input(deleteNotificationChannelSchema)
    .mutation(async ({ input, ctx }) => {
      return notificationChannelService.deleteNotificationChannel({ input, ctx });
    }),

  getAll: orgProcedure
    .input(getNotificationChannelsSchema)
    .query(async ({ input, ctx }) => {
      return notificationChannelService.getNotificationChannels({ input, ctx });
    }),

  getById: orgProcedure
    .input(getNotificationChannelSchema)
    .query(async ({ input, ctx }) => {
      return notificationChannelService.getNotificationChannel({ input, ctx });
    }),
});
