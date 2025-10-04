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
    maxEndpoints: 5,
    maxChecksPerMonth: 10000,
    minCheckInterval: 300000, // 5 minutes
    maxAlerts: 3,
    maxTeamMembers: 1,
    retentionDays: 7,
    rateLimit: {
      requestsPerMinute: 60, // Increased from 10 - allows normal dashboard usage
      requestsPerHour: 1000, // Increased from 100 - ~17 req/min average
    },
  },
  [PlanType.STARTER]: {
    maxEndpoints: 25,
    maxChecksPerMonth: 100000,
    minCheckInterval: 60000, // 1 minute
    maxAlerts: 10,
    maxTeamMembers: 3,
    retentionDays: 30,
    rateLimit: {
      requestsPerMinute: 120, // 2x FREE - supports heavier usage
      requestsPerHour: 3000, // ~50 req/min average
    },
  },
  [PlanType.PRO]: {
    maxEndpoints: 100,
    maxChecksPerMonth: 1000000,
    minCheckInterval: 30000, // 30 seconds
    maxAlerts: 50,
    maxTeamMembers: 10,
    retentionDays: 90,
    rateLimit: {
      requestsPerMinute: 300, // 5x FREE - heavy API usage
      requestsPerHour: 10000, // ~167 req/min average
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
