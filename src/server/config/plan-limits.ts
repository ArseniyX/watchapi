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
            requestsPerMinute: 10,
            requestsPerHour: 100,
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
            requestsPerMinute: 30,
            requestsPerHour: 500,
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
            requestsPerMinute: 100,
            requestsPerHour: 2000,
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
