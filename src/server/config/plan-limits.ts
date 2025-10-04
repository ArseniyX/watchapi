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
    maxEndpoints: 10,
    maxChecksPerMonth: 43200, // ~1 check per endpoint per hour (10 endpoints × 24 hours × 30 days / 2)
    minCheckInterval: 3600000, // 1 hour
    maxAlerts: 3,
    maxTeamMembers: 3, // Compete with Postman's 3 free users
    retentionDays: 7,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
  },
  [PlanType.STARTER]: {
    maxEndpoints: 50,
    maxChecksPerMonth: 2160000, // ~1 check per endpoint per minute (50 × 60 × 24 × 30)
    minCheckInterval: 60000, // 1 minute
    maxAlerts: 20,
    maxTeamMembers: 10, // Much more generous than Postman
    retentionDays: 30,
    rateLimit: {
      requestsPerMinute: 120,
      requestsPerHour: 3000,
    },
  },
  [PlanType.PRO]: {
    maxEndpoints: 250,
    maxChecksPerMonth: 10800000, // ~1 check per endpoint every 30 seconds (250 × 2 × 60 × 24 × 30)
    minCheckInterval: 30000, // 30 seconds
    maxAlerts: 100,
    maxTeamMembers: 25, // vs Postman Pro at $975/month for 25 users
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
