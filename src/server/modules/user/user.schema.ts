import { z } from "zod";
import { UserRole, PlanType } from "@/generated/prisma";

// User creation schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  name: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  skipPersonalOrg: z.boolean().optional(),
});

export const createOAuthUserSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  name: z.string().optional(),
  provider: z.string().min(1, "Provider is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  avatar: z.string().url("Invalid avatar URL").optional(),
  skipPersonalOrg: z.boolean().optional(),
});

// User update schemas
export const updateUserSchema = z.object({
  name: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  provider: z.string().optional(),
  providerId: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  role: z.nativeEnum(UserRole).optional(),
  plan: z.nativeEnum(PlanType).optional(),
  planExpiresAt: z.date().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Query schemas
export const getUsersSchema = z.object({
  skip: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(10),
});

// Infer types from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateOAuthUserInput = z.infer<typeof createOAuthUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GetUsersInput = z.infer<typeof getUsersSchema>;
