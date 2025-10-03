import { z } from "zod";
import { NotificationType } from "@/generated/prisma";

export const notificationTypeSchema = z.nativeEnum(NotificationType);

// Config schemas for different notification types
export const emailConfigSchema = z.object({
  emails: z.array(z.string().email()).min(1, "At least one email required"),
});

export const webhookConfigSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  headers: z.record(z.string()).optional(),
});

export const slackConfigSchema = z.object({
  webhookUrl: z.string().url("Must be a valid Slack webhook URL"),
});

export const discordConfigSchema = z.object({
  webhookUrl: z.string().url("Must be a valid Discord webhook URL"),
});

// Union type for all configs
export const notificationConfigSchema = z.union([
  emailConfigSchema,
  webhookConfigSchema,
  slackConfigSchema,
  discordConfigSchema,
]);

export const createNotificationChannelSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1, "Name is required").max(100),
  type: notificationTypeSchema,
  config: z.string(), // JSON stringified config
});

export const updateNotificationChannelSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string().min(1, "Name is required").max(100).optional(),
  config: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const deleteNotificationChannelSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
});

export const getNotificationChannelsSchema = z.object({
  organizationId: z.string(),
});

export const getNotificationChannelSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
});

// Inferred types
export type CreateNotificationChannelInput = z.infer<typeof createNotificationChannelSchema>;
export type UpdateNotificationChannelInput = z.infer<typeof updateNotificationChannelSchema>;
export type DeleteNotificationChannelInput = z.infer<typeof deleteNotificationChannelSchema>;
export type GetNotificationChannelsInput = z.infer<typeof getNotificationChannelsSchema>;
export type GetNotificationChannelInput = z.infer<typeof getNotificationChannelSchema>;

export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type WebhookConfig = z.infer<typeof webhookConfigSchema>;
export type SlackConfig = z.infer<typeof slackConfigSchema>;
export type DiscordConfig = z.infer<typeof discordConfigSchema>;
export type NotificationConfig = EmailConfig | WebhookConfig | SlackConfig | DiscordConfig;
