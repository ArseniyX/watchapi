import { z } from "zod";
import { HttpMethod } from "@/generated/prisma";

// Monitoring check schemas
export const checkEndpointSchema = z.object({
    id: z.string().min(1, "Endpoint ID is required"),
});

export const sendRequestSchema = z.object({
    url: z.string().url("Invalid URL format").min(1, "URL is required"),
    method: z.nativeEnum(HttpMethod),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
});

// History and stats query schemas
export const getHistorySchema = z.object({
    endpointId: z.string().min(1, "Endpoint ID is required"),
    skip: z.number().min(0).default(0),
    take: z.number().min(1).max(100).default(50),
});

export const getUptimeStatsSchema = z.object({
    endpointId: z.string().min(1, "Endpoint ID is required"),
    days: z.number().min(1).max(365).default(30),
});

export const getAverageResponseTimeSchema = z.object({
    endpointId: z.string().min(1, "Endpoint ID is required"),
    days: z.number().min(1).max(365).default(30),
});

export const getResponseTimeHistorySchema = z.object({
    endpointId: z.string().min(1, "Endpoint ID is required"),
    days: z.number().min(1).max(365).default(7),
});

// Analytics schemas
export const getAnalyticsSchema = z.object({
    days: z.number().min(1).max(365).default(7),
});

export const getTopEndpointsSchema = z.object({
    days: z.number().min(1).max(365).default(7),
    limit: z.number().min(1).max(50).default(5),
});

export const getResponseTimeChartSchema = z.object({
    days: z.number().min(1).max(365).default(7),
});

export const getUptimeChartSchema = z.object({
    days: z.number().min(1).max(365).default(7),
});

export const getRecentFailuresSchema = z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    limit: z.number().min(1).max(100).default(50),
});

// Infer types from schemas
export type CheckEndpointInput = z.infer<typeof checkEndpointSchema>;
export type SendRequestInput = z.infer<typeof sendRequestSchema>;
export type GetHistoryInput = z.infer<typeof getHistorySchema>;
export type GetUptimeStatsInput = z.infer<typeof getUptimeStatsSchema>;
export type GetAverageResponseTimeInput = z.infer<typeof getAverageResponseTimeSchema>;
export type GetResponseTimeHistoryInput = z.infer<typeof getResponseTimeHistorySchema>;
export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>;
export type GetTopEndpointsInput = z.infer<typeof getTopEndpointsSchema>;
export type GetResponseTimeChartInput = z.infer<typeof getResponseTimeChartSchema>;
export type GetUptimeChartInput = z.infer<typeof getUptimeChartSchema>;
export type GetRecentFailuresInput = z.infer<typeof getRecentFailuresSchema>;
