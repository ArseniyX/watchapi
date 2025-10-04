import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import jwt from "jsonwebtoken";
import { prisma } from "./database";
import { PlanType } from "@/generated/prisma";
import { logger, logError } from "@/lib/logger";
import { isAppError } from "./errors/custom-errors";

export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  organizationId?: string;
  organizationPlan?: PlanType;
}

export const createTRPCContext = async (
  opts: CreateNextContextOptions,
): Promise<Context> => {
  const { req } = opts;

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return {};
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return {};
    }

    // Get organization from header or use user's personal organization
    const orgHeader = req.headers["x-organization-id"] as string | undefined;
    let organizationId = orgHeader;

    if (!organizationId) {
      // Get user's personal organization (or first organization they're a member of)
      const membership = await prisma.organizationMember.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        select: { organizationId: true },
        orderBy: { joinedAt: "asc" }, // Use earliest joined (personal org)
      });

      organizationId = membership?.organizationId;
    }

    // Verify user has access to the organization and get org plan
    let organizationPlan: PlanType | undefined;
    if (organizationId) {
      const hasAccess = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: organizationId,
          },
        },
      });

      if (!hasAccess) {
        // User doesn't have access to requested org, fall back to personal
        const membership = await prisma.organizationMember.findFirst({
          where: { userId: user.id, status: "ACTIVE" },
          select: { organizationId: true },
          orderBy: { joinedAt: "asc" },
        });
        organizationId = membership?.organizationId;
      }

      // Fetch organization plan
      if (organizationId) {
        const org = await prisma.organization.findUnique({
          where: { id: organizationId },
          select: { plan: true },
        });
        organizationPlan = org?.plan;
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      organizationId,
      organizationPlan,
    };
  } catch (error) {
    logError("JWT verification failed", error, {
      hasAuthHeader: !!authHeader,
      tokenPrefix: authHeader?.substring(0, 20),
    });
    return {};
  }
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    // Convert custom AppError to proper tRPC error
    // tRPC wraps thrown errors in error.cause, so check there first
    if (error.cause && isAppError(error.cause)) {
      const appError = error.cause;
      return {
        ...shape,
        message: appError.message,
        data: {
          ...shape.data,
          code: appError.getTRPCCode(),
        },
      };
    }

    // Also check if the error itself is an AppError (shouldn't happen but defensive)
    if (isAppError(error)) {
      return {
        ...shape,
        message: error.message,
        data: {
          ...shape.data,
          code: error.getTRPCCode(),
        },
      };
    }

    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    logger.warn("Unauthorized access attempt");
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Apply rate limiting (per-user, based on org plan)
  const { checkRateLimit } = await import("./middleware/rate-limit");
  await checkRateLimit(ctx.user.id, ctx.organizationPlan || PlanType.FREE);

  return next({
    ctx: {
      user: ctx.user,
      organizationId: ctx.organizationId,
      organizationPlan: ctx.organizationPlan,
    },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN" && ctx.user.role !== "SUPER_ADMIN") {
    logger.warn("Forbidden access attempt", {
      userId: ctx.user.id,
      role: ctx.user.role,
    });
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
