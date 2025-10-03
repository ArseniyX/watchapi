import { TRPCError, initTRPC } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import jwt from 'jsonwebtoken'
import { prisma } from './database'
import { PlanType } from '@/generated/prisma'

export interface Context {
  user?: {
    id: string
    email: string
    role: string
    plan: PlanType
  }
}

export const createTRPCContext = async (opts: CreateNextContextOptions): Promise<Context> => {
  const { req } = opts

  // Get token from Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return {}
  }

  const token = authHeader.substring(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
      role: string
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, plan: true }
    })

    if (!user) {
      return {}
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    }
  } catch (error) {
    return {}
  }
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // Apply rate limiting
  const { checkRateLimit } = await import('./middleware/rate-limit')
  await checkRateLimit(ctx.user.id, ctx.user.plan)

  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPER_ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})