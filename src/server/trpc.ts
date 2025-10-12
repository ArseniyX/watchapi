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

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return {};
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
      activeOrganizationId: string;
    };

    const organizationId = payload.activeOrganizationId;

    if (!organizationId) {
      console.log("No organization ID found in token");
      return {};
    }

    const [user, org] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true },
      }),
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { plan: true },
      }),
    ]);
    if (!user) return {};
    if (!org) return {};
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      organizationId: organizationId,
      organizationPlan: org?.plan,
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

// User authenticated, no organization context required
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

// User authenticated + organization context required
// Use this for most operations (API endpoints, collections, monitoring, etc.)
export const orgProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.organizationId) {
    logger.warn("Missing organization context", {
      userId: ctx.user.id,
      email: ctx.user.email,
    });
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Organization context is required",
    });
  }
  return next({ ctx });
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
