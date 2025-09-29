import { z } from 'zod'
import { router, publicProcedure } from '../../trpc'
import { AuthService } from './auth.service'

export const createAuthRouter = (authService: AuthService) =>
  router({
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().optional(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.register(input)
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
          tokens: result.tokens,
        }
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await authService.login(input)
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
          tokens: result.tokens,
        }
      }),

    refreshToken: publicProcedure
      .input(
        z.object({
          refreshToken: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return authService.refreshToken(input.refreshToken)
      }),

    verifyToken: publicProcedure
      .input(
        z.object({
          token: z.string(),
        })
      )
      .query(async ({ input }) => {
        const user = await authService.verifyToken(input.token)
        if (!user) {
          return null
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }),
  })