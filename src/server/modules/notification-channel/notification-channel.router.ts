import { router, protectedProcedure } from "../../trpc";
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
  create: protectedProcedure
    .input(createNotificationChannelSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      // Verify the requested org matches user's context for security
      if (input.organizationId !== ctx.organizationId) {
        throw new Error("Access denied to requested organization");
      }
      return notificationChannelService.createNotificationChannel(input);
    }),

  update: protectedProcedure
    .input(updateNotificationChannelSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      // Verify the requested org matches user's context for security
      if (input.organizationId !== ctx.organizationId) {
        throw new Error("Access denied to requested organization");
      }
      return notificationChannelService.updateNotificationChannel(input);
    }),

  delete: protectedProcedure
    .input(deleteNotificationChannelSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      // Verify the requested org matches user's context for security
      if (input.organizationId !== ctx.organizationId) {
        throw new Error("Access denied to requested organization");
      }
      return notificationChannelService.deleteNotificationChannel(input);
    }),

  getAll: protectedProcedure
    .input(getNotificationChannelsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      // Verify the requested org matches user's context for security
      if (input.organizationId !== ctx.organizationId) {
        throw new Error("Access denied to requested organization");
      }
      return notificationChannelService.getNotificationChannels(input);
    }),

  getById: protectedProcedure
    .input(getNotificationChannelSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      // Verify the requested org matches user's context for security
      if (input.organizationId !== ctx.organizationId) {
        throw new Error("Access denied to requested organization");
      }
      return notificationChannelService.getNotificationChannel(input);
    }),
});
