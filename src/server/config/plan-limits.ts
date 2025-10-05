import { PlanType } from "@/generated/prisma";

export interface PlanLimits {
  maxEndpoints: number; // Max ACTIVE endpoints (with monitoring enabled). -1 = unlimited. Inactive endpoints have no limit.
  maxChecksPerMonth: number;
  minCheckInterval: number; // in milliseconds
  maxAlerts: number; // Maximum alerts across all endpoints
  maxTeamMembers: number;
  retentionDays: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxEndpoints: 3, // 3 active monitors (unlimited inactive endpoints)
    maxChecksPerMonth: 4320, // ~3 active monitors × 2 checks/hour × 30 days (3 × 2 × 24 × 30)
    minCheckInterval: 1800000, // 30 minutes
    maxAlerts: 3, // 3 alerts total
    maxTeamMembers: 1,
    retentionDays: 7,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
  },
  [PlanType.STARTER]: {
    maxEndpoints: 25, // 25 active monitors (unlimited inactive endpoints)
    maxChecksPerMonth: 1080000, // ~25 active monitors × 30 checks/hour × 30 days (25 × 30 × 24 × 30)
    minCheckInterval: 120000, // 2 minutes
    maxAlerts: 25, // 25 alerts total
    maxTeamMembers: 5,
    retentionDays: 30,
    rateLimit: {
      requestsPerMinute: 120,
      requestsPerHour: 3000,
    },
  },
  [PlanType.PRO]: {
    maxEndpoints: 100, // 100 active monitors (unlimited inactive endpoints)
    maxChecksPerMonth: 4320000, // ~100 active monitors × 60 checks/hour × 30 days (100 × 60 × 24 × 30)
    minCheckInterval: 60000, // 1 minute
    maxAlerts: 100, // 100 alerts total
    maxTeamMembers: 15,
    retentionDays: 90,
    rateLimit: {
      requestsPerMinute: 300,
      requestsPerHour: 10000,
    },
  },
  [PlanType.ENTERPRISE]: {
    maxEndpoints: -1, // unlimited active monitors
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
