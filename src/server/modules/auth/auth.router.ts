import { router, publicProcedure } from "../../trpc";
import { AuthService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyTokenSchema,
  oauthCallbackSchema,
} from "./auth.schema";

export const createAuthRouter = (authService: AuthService) =>
  router({
    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ ctx, input }) => {
        const result = await authService.register({ ctx, input });
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            avatar: result.user.avatar,
            role: result.user.role,
          },
          tokens: result.tokens,
        };
      }),

    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ ctx, input }) => {
        const result = await authService.login({ ctx, input });
        return {
          user: {
            id: result.user.id,
            avatar: result.user.avatar,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
          tokens: result.tokens,
        };
      }),

    refreshToken: publicProcedure
      .input(refreshTokenSchema)
      .mutation(async ({ ctx, input }) => {
        return authService.refreshToken({ ctx, input });
      }),

    verifyToken: publicProcedure
      .input(verifyTokenSchema)
      .query(async ({ ctx, input }) => {
        const user = await authService.verifyToken({ ctx, input });
        if (!user) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        };
      }),

    oauthCallback: publicProcedure
      .input(oauthCallbackSchema)
      .mutation(async ({ ctx, input }) => {
        const result = await authService.authenticateWithOAuth({
          ctx,
          input,
        });
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            avatar: result.user.avatar,
          },
          tokens: result.tokens,
          isNewUser: result.isNewUser,
        };
      }),
  });
