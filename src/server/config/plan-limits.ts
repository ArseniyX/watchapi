import { PlanType } from "@/generated/prisma";

export interface PlanLimits {
  maxEndpoints: number;
  maxChecksPerMonth: number;
  minCheckInterval: number; // in milliseconds
  maxAlerts: number;
  maxTeamMembers: number;
  retentionDays: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxEndpoints: 3,
    maxChecksPerMonth: 4320, // ~3 endpoints × 2 checks/hour × 30 days (3 × 2 × 24 × 30)
    minCheckInterval: 1800000, // 30 minutes
    maxAlerts: 3,
    maxTeamMembers: 1, // Force team upgrade for collaboration
    retentionDays: 7,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
  },
  [PlanType.STARTER]: {
    maxEndpoints: 25,
    maxChecksPerMonth: 1080000, // ~25 endpoints × 30 checks/hour × 30 days (25 × 30 × 24 × 30)
    minCheckInterval: 120000, // 2 minutes
    maxAlerts: 20,
    maxTeamMembers: 5, // Right-sized for small teams
    retentionDays: 30,
    rateLimit: {
      requestsPerMinute: 120,
      requestsPerHour: 3000,
    },
  },
  [PlanType.PRO]: {
    maxEndpoints: 100,
    maxChecksPerMonth: 4320000, // ~100 endpoints × 60 checks/hour × 30 days (100 × 60 × 24 × 30)
    minCheckInterval: 60000, // 1 minute
    maxAlerts: 50,
    maxTeamMembers: 15, // Production teams
    retentionDays: 90,
    rateLimit: {
      requestsPerMinute: 300,
      requestsPerHour: 10000,
    },
  },
  [PlanType.ENTERPRISE]: {
    maxEndpoints: -1, // unlimited
    maxChecksPerMonth: -1, // unlimited
    minCheckInterval: 10000, // 10 seconds
    maxAlerts: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    retentionDays: 365,
    rateLimit: {
      requestsPerMinute: 1000,
      requestsPerHour: 20000,
    },
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}
