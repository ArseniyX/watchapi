import { router, protectedProcedure } from "../../trpc";
import { UserService } from "./user.service";
import {
  updateProfileSchema,
  changePasswordSchema,
  getUsersSchema,
} from "./user.schema";

export const createUserRouter = (userService: UserService) =>
  router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return userService.getUserById(ctx.user.id);
    }),

    getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
      return userService.getOnboardingStatus(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(updateProfileSchema)
      .mutation(async ({ input, ctx }) => {
        return userService.updateUser(ctx.user.id, input);
      }),

    changePassword: protectedProcedure
      .input(changePasswordSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await userService.getUserById(ctx.user.id);
        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await userService.verifyPassword(
          user,
          input.currentPassword,
        );
        if (!isValid) {
          throw new Error("Current password is incorrect");
        }

        return userService.updateUser(ctx.user.id, {
          password: input.newPassword,
        });
      }),

    getUsers: protectedProcedure
      .input(getUsersSchema)
      .query(async ({ input }) => {
        return userService.getUsers(input);
      }),
  });
