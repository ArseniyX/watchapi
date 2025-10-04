import { z } from "zod";
import { OrganizationRole, MemberStatus } from "@/generated/prisma";

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
});

// Member schemas - Use Prisma enums as source of truth
export const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  role: z.nativeEnum(OrganizationRole),
  status: z.nativeEnum(MemberStatus).default(MemberStatus.ACTIVE),
});

export const updateMemberRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  role: z.nativeEnum(OrganizationRole),
});

export const removeMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Infer types from schemas
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
