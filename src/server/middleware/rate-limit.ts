import { TRPCError } from "@trpc/server";
import { PlanType } from "@/generated/prisma";
import { getPlanLimits, isUnlimited } from "../config/plan-limits";

interface RateLimitStore {
  [userId: string]: {
    minute: { count: number; resetAt: number };
    hour: { count: number; resetAt: number };
  };
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((userId) => {
      const userLimits = rateLimitStore[userId];
      if (userLimits.minute.resetAt < now && userLimits.hour.resetAt < now) {
        delete rateLimitStore[userId];
      }
    });
  },
  5 * 60 * 1000,
);

export async function checkRateLimit(
  userId: string,
  userPlan: PlanType,
): Promise<void> {
  const limits = getPlanLimits(userPlan);
  const now = Date.now();

  // Initialize user limits if not exists
  if (!rateLimitStore[userId]) {
    rateLimitStore[userId] = {
      minute: { count: 0, resetAt: now + 60 * 1000 },
      hour: { count: 0, resetAt: now + 60 * 60 * 1000 },
    };
  }

  const userLimits = rateLimitStore[userId];

  // Reset minute counter if expired
  if (userLimits.minute.resetAt < now) {
    userLimits.minute = { count: 0, resetAt: now + 60 * 1000 };
  }

  // Reset hour counter if expired
  if (userLimits.hour.resetAt < now) {
    userLimits.hour = { count: 0, resetAt: now + 60 * 60 * 1000 };
  }

  // Check minute limit
  if (
    !isUnlimited(limits.rateLimit.requestsPerMinute) &&
    userLimits.minute.count >= limits.rateLimit.requestsPerMinute
  ) {
    const resetInSeconds = Math.ceil((userLimits.minute.resetAt - now) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
    });
  }

  // Check hour limit
  if (
    !isUnlimited(limits.rateLimit.requestsPerHour) &&
    userLimits.hour.count >= limits.rateLimit.requestsPerHour
  ) {
    const resetInMinutes = Math.ceil((userLimits.hour.resetAt - now) / 60000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Hourly rate limit exceeded. Try again in ${resetInMinutes} minutes.`,
    });
  }

  // Increment counters
  userLimits.minute.count++;
  userLimits.hour.count++;
}

export function getRateLimitInfo(userId: string, userPlan: PlanType) {
  const limits = getPlanLimits(userPlan);
  const userLimits = rateLimitStore[userId];

  if (!userLimits) {
    return {
      minute: {
        limit: limits.rateLimit.requestsPerMinute,
        remaining: limits.rateLimit.requestsPerMinute,
        resetAt: Date.now() + 60 * 1000,
      },
      hour: {
        limit: limits.rateLimit.requestsPerHour,
        remaining: limits.rateLimit.requestsPerHour,
        resetAt: Date.now() + 60 * 60 * 1000,
      },
    };
  }

  return {
    minute: {
      limit: limits.rateLimit.requestsPerMinute,
      remaining: Math.max(
        0,
        limits.rateLimit.requestsPerMinute - userLimits.minute.count,
      ),
      resetAt: userLimits.minute.resetAt,
    },
    hour: {
      limit: limits.rateLimit.requestsPerHour,
      remaining: Math.max(
        0,
        limits.rateLimit.requestsPerHour - userLimits.hour.count,
      ),
      resetAt: userLimits.hour.resetAt,
    },
  };
}
