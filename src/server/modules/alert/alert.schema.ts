import { z } from "zod";
import { AlertCondition, NotificationType } from "@/generated/prisma";

// Zod schemas for Alert module
export const createAlertSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  apiEndpointId: z.string(),
  condition: z.nativeEnum(AlertCondition),
  threshold: z.number().positive(),
  isActive: z.boolean().default(true),
});

export const updateAlertSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  condition: z.nativeEnum(AlertCondition).optional(),
  threshold: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const getAlertSchema = z.object({
  id: z.string(),
});

export const deleteAlertSchema = z.object({
  id: z.string(),
});

export const getAlertsByEndpointSchema = z.object({
  apiEndpointId: z.string(),
});

export const createAlertNotificationSchema = z.object({
  alertId: z.string(),
  type: z.nativeEnum(NotificationType),
  recipient: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const deleteAlertNotificationSchema = z.object({
  id: z.string(),
});

export const getAlertTriggersSchema = z.object({
  alertId: z.string(),
  limit: z.number().min(1).max(100).default(50),
});

// Type exports
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type UpdateAlertPayload = z.infer<typeof updateAlertSchema>;
export type GetAlertInput = z.infer<typeof getAlertSchema>;
export type DeleteAlertInput = z.infer<typeof deleteAlertSchema>;
export type GetAlertsByEndpointInput = z.infer<
  typeof getAlertsByEndpointSchema
>;
export type CreateAlertNotificationInput = z.infer<
  typeof createAlertNotificationSchema
>;
export type DeleteAlertNotificationInput = z.infer<
  typeof deleteAlertNotificationSchema
>;
export type GetAlertTriggersInput = z.infer<typeof getAlertTriggersSchema>;
