import { router, protectedProcedure } from "../../trpc";
import { NotificationChannelService } from "./notification-channel.service";
import { NotificationChannelRepository } from "./notification-channel.repository";
import {
  createNotificationChannelSchema,
  updateNotificationChannelSchema,
  deleteNotificationChannelSchema,
  getNotificationChannelsSchema,
  getNotificationChannelSchema,
} from "./notification-channel.schema";

const notificationChannelService = new NotificationChannelService(
  new NotificationChannelRepository()
);

export const notificationChannelRouter = router({
  create: protectedProcedure
    .input(createNotificationChannelSchema)
    .mutation(async ({ input }) => {
      return notificationChannelService.createNotificationChannel(input);
    }),

  update: protectedProcedure
    .input(updateNotificationChannelSchema)
    .mutation(async ({ input }) => {
      return notificationChannelService.updateNotificationChannel(input);
    }),

  delete: protectedProcedure
    .input(deleteNotificationChannelSchema)
    .mutation(async ({ input }) => {
      return notificationChannelService.deleteNotificationChannel(input);
    }),

  getAll: protectedProcedure
    .input(getNotificationChannelsSchema)
    .query(async ({ input }) => {
      return notificationChannelService.getNotificationChannels(input);
    }),

  getById: protectedProcedure
    .input(getNotificationChannelSchema)
    .query(async ({ input }) => {
      return notificationChannelService.getNotificationChannel(input);
    }),
});
