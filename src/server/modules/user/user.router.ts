import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../../trpc'
import { UserService } from './user.service'

export const createUserRouter = (userService: UserService) =>
  router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return userService.getUserById(ctx.user.id)
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return userService.updateUser(ctx.user.id, input)
      }),

    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string(),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await userService.getUserById(ctx.user.id)
        if (!user) {
          throw new Error('User not found')
        }

        const isValid = await userService.verifyPassword(user, input.currentPassword)
        if (!isValid) {
          throw new Error('Current password is incorrect')
        }

        return userService.updateUser(ctx.user.id, {
          password: input.newPassword,
        })
      }),

    getUsers: protectedProcedure
      .input(
        z.object({
          skip: z.number().default(0),
          take: z.number().default(10),
        })
      )
      .query(async ({ input }) => {
        return userService.getUsers(input)
      }),
  })