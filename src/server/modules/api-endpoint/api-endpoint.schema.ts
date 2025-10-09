import { z } from "zod";
import { HttpMethod } from "@/generated/prisma";

// API Endpoint creation schema
export const createApiEndpointSchema = z.object({
  name: z.string().min(1, "Endpoint name is required"),
  url: z.string(), // Allow any string, validation happens when endpoint is activated
  method: z.nativeEnum(HttpMethod).default(HttpMethod.GET),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  expectedStatus: z.number().int().min(100).max(599).default(200),
  timeout: z
    .number()
    .int()
    .positive("Timeout must be greater than 0")
    .default(30000),
  interval: z
    .number()
    .int()
    .positive("Interval must be greater than 0")
    .default(300000), // 5 minutes
  collectionId: z.string().optional(),
  isActive: z.boolean().optional().default(false), // Monitoring disabled by default
});

// API Endpoint update schema
export const updateApiEndpointSchema = z.object({
  name: z.string().min(1, "Endpoint name cannot be empty").optional(),
  url: z
    .string()
    .url("Invalid URL format")
    .min(1, "URL cannot be empty")
    .optional(),
  method: z.nativeEnum(HttpMethod).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  expectedStatus: z.number().int().min(100).max(599).optional(),
  timeout: z
    .number()
    .int()
    .positive("Timeout must be greater than 0")
    .optional(),
  interval: z
    .number()
    .int()
    .positive("Interval must be greater than 0")
    .optional(),
  isActive: z.boolean().optional(),
});

// Query schemas
export const getApiEndpointSchema = z.object({
  id: z.string().min(1, "Endpoint ID is required"),
});

export const deleteApiEndpointSchema = z.object({
  id: z.string().min(1, "Endpoint ID is required"),
});

export const getOrganizationEndpointsSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export const searchEndpointsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

// Infer types from schemas
export type CreateApiEndpointInput = z.infer<typeof createApiEndpointSchema>;
export type UpdateApiEndpointInput = z.infer<typeof updateApiEndpointSchema>;
export type GetApiEndpointInput = z.infer<typeof getApiEndpointSchema>;
export type DeleteApiEndpointInput = z.infer<typeof deleteApiEndpointSchema>;
export type GetOrganizationEndpointsInput = z.infer<
  typeof getOrganizationEndpointsSchema
>;
export type SearchEndpointsInput = z.infer<typeof searchEndpointsSchema>;
