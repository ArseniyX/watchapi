import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import jwt from "jsonwebtoken";
import { prisma } from "./database";
import { PlanType } from "@/generated/prisma";
import { logger, logError } from "@/lib/logger";

export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
    plan: PlanType;
  };
  organizationId?: string;
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
      select: { id: true, email: true, role: true, plan: true },
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

    // Verify user has access to the organization
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
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
      organizationId,
    };
  } catch (error) {
    logError("JWT verification failed", error, {
      hasAuthHeader: !!authHeader,
      tokenPrefix: authHeader?.substring(0, 20),
    });
    return {};
  }
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    logger.warn("Unauthorized access attempt");
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Apply rate limiting
  const { checkRateLimit } = await import("./middleware/rate-limit");
  await checkRateLimit(ctx.user.id, ctx.user.plan);

  return next({
    ctx: {
      user: ctx.user,
      organizationId: ctx.organizationId,
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
